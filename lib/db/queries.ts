import "server-only";
import { type User, type Suggestion, Prisma } from "@/prisma/generated/prisma";
import type { ArtifactKind } from "@/components/chat/artifact";
import { generateUUID } from "../utils";
import { generateHashedPassword } from "./utils";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { prisma } from "../prisma";
import { createClient } from "../utils/server";
import { cookies } from "next/headers";
import { sendMail } from "../email";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await prisma.user.findMany({
      where: { email },
    });
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerified: false,
      },
    });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}@example.com`; // Opcional: colocar um domínio para manter o formato de e-mail válido
  const password = generateHashedPassword(generateUUID());

  try {
    return await prisma.user.create({
      data: {
        email,
        password,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
      },
    });
  } catch (error) {
    console.error("Failed to create guest user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await prisma.chat.create({
      data: {
        id,
        createdAt: new Date(),
        userId,
        title,
        visibility,
      },
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Deleta registros relacionados primeiro
    await prisma.vote.deleteMany({
      where: { chatId: id },
    });

    await prisma.message.deleteMany({
      where: { chatId: id },
    });

    await prisma.stream.deleteMany({
      where: { chatId: id },
    });

    // Depois deleta o chat e retorna o registro deletado
    const deletedChat = await prisma.chat.delete({
      where: { id },
    });

    return deletedChat;
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    let whereClause: any = {
      userId: id,
    };

    if (startingAfter) {
      const referenceChat = await prisma.chat.findUnique({
        where: { id: startingAfter },
        select: { createdAt: true },
      });

      if (!referenceChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      whereClause.createdAt = {
        gt: referenceChat.createdAt,
      };
    } else if (endingBefore) {
      const referenceChat = await prisma.chat.findUnique({
        where: { id: endingBefore },
        select: { createdAt: true },
      });

      if (!referenceChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      whereClause.createdAt = {
        lt: referenceChat.createdAt,
      };
    }

    const chats = await prisma.chat.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: extendedLimit,
    });

    const hasMore = chats.length > limit;

    return {
      chats: hasMore ? chats.slice(0, limit) : chats,
      hasMore,
    };
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.findUniqueOrThrow({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<Prisma.MessageCreateManyInput>;
}) {
  try {
    return await prisma.message.createMany({
      data: messages,
    });
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    return await prisma.vote.upsert({
      where: {
        chatId_messageId: {
          messageId,
          chatId,
        },
      },
      update: {
        isUpvoted: type === "up",
      },
      create: {
        chatId,
        messageId,
        isUpvoted: type === "up",
      },
    });
  } catch (error) {
    console.error("Failed to vote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await prisma.vote.findMany({
      where: { chatId: id },
    });
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await prisma.document.create({
      data: {
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to save document in database");
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return await prisma.document.findMany({
      where: { id },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    return await prisma.document.findFirst({
      where: { id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    // Deleta sugestões relacionadas
    await prisma.suggestion.deleteMany({
      where: {
        documentId: id,
        documentCreatedAt: {
          gt: timestamp,
        },
      },
    });

    // Deleta documentos
    return await prisma.document.deleteMany({
      where: {
        id,
        createdAt: {
          gt: timestamp,
        },
      },
    });
  } catch (error) {
    console.error(
      "Failed to delete documents by id after timestamp from database"
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await prisma.suggestion.createMany({
      data: suggestions,
      skipDuplicates: true, // opcional
    });
  } catch (error) {
    console.error("Failed to save suggestions in database");
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await prisma.suggestion.findMany({
      where: { documentId },
    });
  } catch (error) {
    console.error(
      "Failed to get suggestions by document version from database"
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await prisma.message.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await prisma.message.findMany({
      where: {
        chatId,
        createdAt: {
          gte: timestamp,
        },
      },
      select: {
        id: true,
      },
    });

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await prisma.vote.deleteMany({
        where: {
          chatId,
          messageId: {
            in: messageIds,
          },
        },
      });

      return await prisma.message.deleteMany({
        where: {
          chatId,
          id: {
            in: messageIds,
          },
        },
      });
    }
  } catch (error) {
    console.error(
      "Failed to delete messages by id after timestamp from database"
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { visibility },
    });
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const dateThreshold = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const countResult = await prisma.message.count({
      where: {
        createdAt: {
          gte: dateThreshold,
        },
        role: "user",
        chat: {
          userId: id,
        },
      },
    });

    return countResult;
  } catch (error) {
    console.error(
      "Failed to get message count by user id for the last 24 hours from database"
    );
    throw error;
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await prisma.stream.create({
      data: {
        id: streamId,
        chatId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to create stream id in database");
    throw error;
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streams = await prisma.stream.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    return streams.map(({ id }) => id);
  } catch (error) {
    console.error("Failed to get stream ids by chat id from database");
    throw error;
  }
}

export async function getTenders(
  searchParams?: {
    page?: string;
    limit?: string;
    uf?: string;
    q?: string; // termo de busca no purchaseObject
    disputeModeName?: string;
    modalityName?: string;
  },
  rangeStart?: Date,
  rangeEnd?: Date,
  keywords?: string[]
) {
  const page = Number(searchParams?.page || 1);
  const limit = Number(searchParams?.limit || 50);
  const q = searchParams?.q?.trim();
  const uf = searchParams?.uf;
  const disputeModeName = searchParams?.disputeModeName;
  const modalityName = searchParams?.modalityName;

  if (process.env.NODE_ENV === "development") {
    const where: Prisma.TenderWhereInput = {
      proposalClosingDate: {
        gte: new Date(),
      },
    };

    if (q) {
      where.purchaseObject = { contains: q, mode: "insensitive" };
    }
    if (rangeStart && rangeEnd) {
      where.publicationDatePncp = {
        gte: rangeStart,
        lte: rangeEnd,
      };
    }
    if (keywords) {
      where.purchaseObject = {
        contains: keywords.join(" "),
      };
    }
    if (uf) {
      where.unidadeOrgao = {
        stateAbbr: uf,
      };
    }
    if (disputeModeName) {
      where.disputeModeName = disputeModeName;
    }
    if (modalityName) {
      where.modalityName = modalityName;
    }

    const [tenders, totalTenders] = await Promise.all([
      prisma.tender.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          unidadeOrgao: true,
          orgaoEntidade: true,
        },
      }),
      prisma.tender.count({ where }),
    ]);

    const totalPages = Math.ceil(totalTenders / limit);

    return { tenders, totalPages, page, limit };
  } else {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const params = searchParams;
    const page = parseInt(params?.page || "1");
    const limit = parseInt(params?.limit || "50");
    const offset = (page - 1) * limit;

    const filters = [];

    // Filtros simples
    if (params?.uf) {
      filters.push(`unidadeOrgao.stateAbbr=eq.${params.uf}`);
    }

    if (params?.disputeModeName) {
      filters.push(`disputeModeName=eq.${params.disputeModeName}`);
    }

    if (params?.modalityName) {
      filters.push(`modalityName=eq.${params.modalityName}`);
    }

    if (rangeEnd && rangeStart) {
      filters.push(
        `publicationDatePncp=lt.${rangeEnd.toISOString()}`,
        `publicationDatePncp=lt.${rangeEnd.toISOString()}`
      );
      filters.push(
        `proposalClosingDate=gt.${rangeStart.toISOString()}`,
        `proposalClosingDate=gt.${rangeStart.toISOString()}`
      );
    }

    const queryBuilder = supabase
      .from("Tender")
      .select(
        `
      *,
      unidadeOrgao:unidadeOrgaoId!inner(*),
      orgaoEntidade:orgaoEntidadeId(*)
      `,
        { count: "exact" }
      )
      .range(offset, offset + limit - 1);

    const keywordsQuery = keywords;

    if (keywordsQuery && keywordsQuery.length > 0) {
      const orQuery = keywordsQuery.join(" or ");
      queryBuilder.textSearch("purchaseObject", orQuery, {
        type: "websearch",
        config: "portuguese",
      });
    }

    // Full-text search apenas no campo purchaseObject
    const textSearchQuery = params?.q
      ?.split(",")
      .map((term) => term.trim())
      .filter(Boolean);

    if (textSearchQuery && textSearchQuery.length > 0) {
      const orQuery = textSearchQuery.join(" or ");

      queryBuilder.textSearch("search_vector", orQuery, {
        type: "websearch",
        config: "portuguese",
      });
    }

    // Aplicar filtros extras
    for (const filter of filters) {
      const [col, val] = filter.split("=");
      queryBuilder.filter(col, val.split(".")[0] as any, val.split(".")[1]);
    }

    queryBuilder.or(
      `proposalClosingDate.gte.${new Date().toISOString()},proposalClosingDate.is.null`
    );

    const { data: tenders, count, error } = await queryBuilder;

    if (error) {
      console.error(error);
    }

    const totalPages = Math.ceil((count ?? 0) / limit);

    return { tenders, page, totalPages, limit };
  }
}

export async function updateTender(
  where: Prisma.TenderWhereInput,
  data: Prisma.TenderUpdateInput
) {
  const tender = await prisma.tender.findFirstOrThrow({
    where,
    select: {
      id: true,
      followedBy: {
        select: { id: true, email: true, name: true },
        where: { UserPreferences: { emailNotification: true } },
      },
      globalUpdateDate: true,
      updateDate: true,
    },
  });

  if (
    data.globalUpdateDate &&
    (typeof data.globalUpdateDate === "string" ||
      data.globalUpdateDate instanceof Date) &&
    tender.globalUpdateDate.getTime() !==
      new Date(data.globalUpdateDate).getTime()
  ) {
    const updatedTender = await prisma.tender.update({
      where: { id: tender.id },
      data,
    });

    for (const user of tender.followedBy) {
      await sendMail({
        to: user.email,
        subject: `Atualização da licitação ${updatedTender.purchaseNumber}/${updatedTender.purchaseYear}`,
        template: "update-tender",
        context: {
          ...updatedTender,
          userName: user.name,
          id: updatedTender.id,
        },
      });
    }

    return updatedTender;
  }

  return null;
}
