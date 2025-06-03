import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from "ai";
import { systemPrompt } from "@/lib/ai/prompts";
import { generateUUID, getTrailingMessageId } from "@/lib/utils";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { isProductionEnvironment } from "@/lib/constants";
import { myProvider } from "@/lib/ai/providers";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { postRequestBodySchema, type PostRequestBody } from "./schema";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { after } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTitleFromUserMessage } from "@/app/(dashboard)/analyzer/actions";
import { differenceInSeconds } from "date-fns";
import { Chat } from "@prisma/client";
import {
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  getStreamIdsByChatId,
} from "@/lib/db/queries";
import { checkIfRelatedToFile } from "@/lib/utils/server";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new Response("Invalid request body", { status: 400 });
  }

  try {
    let { id, message } = requestBody;

    const selectedChatModel = "chat-model";

    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userType = "regular";

    const messageCount = await prisma.message.count({
      where: {
        chat: {
          userId: session.user.id,
        },
        createdAt: {
          gte: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      },
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new Response(
        "You have exceeded your maximum number of messages for the day! Please try again later.",
        {
          status: 429,
        }
      );
    }

    let chat = await prisma.chat.findUnique({ where: { id } });

    if (!chat) {
      const title = await generateTitleFromUserMessage({ message });

      chat = await prisma.chat.create({
        data: {
          id,
          userId: session.user.id,
          title,
          visibility: "private",
          createdAt: new Date(),
        },
      });

      // Atualize o ID aqui!
      id = chat.id;
    } else {
      if (chat.userId !== session.user.id) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const previousMessages = await prisma.message.findMany({
      where: {
        chatId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const conversationHistory = previousMessages
      .map((msg) => {
        const role = msg.role === "user" ? "Usuário" : "Assistente";
        // @ts-expect-error
        const text = msg.parts
          // @ts-expect-error
          .filter((part) => part.type === "text")
          // @ts-expect-error
          .map((part) => part.text)
          .join(" ");
        return `${role}: ${text}`;
      })
      .slice(-10)
      .join("\n");

    const relatedToFile = await checkIfRelatedToFile(
      conversationHistory,
      message.content
    );

    if (relatedToFile) {
      const pdfContent = previousMessages.flatMap((m) => m.attachments ?? []);

      const uniqueAttachments = {};

      for (const attachment of pdfContent) {
        // @ts-expect-error
        uniqueAttachments[attachment.url] = attachment;
      }

      message.experimental_attachments = Object.values(uniqueAttachments);
    }

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    const userContext = await prisma.onboardingResponse.findMany({
      where: {
        userId: session.user.id,
      },
    });

    await prisma.message.create({
      data: {
        id: message.id,
        chatId: id,
        role: "user",
        parts: message.parts,
        attachments: message.experimental_attachments ?? [],
        createdAt: new Date(),
      },
    });

    const streamId = generateUUID();

    await prisma.stream.create({
      data: {
        id: streamId,
        chatId: id,
        createdAt: new Date(),
      },
    });

    const stream = createDataStream({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, userContext }),
          messages: messages,
          maxSteps: 5,
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === "assistant"
                  ),
                });

                if (!assistantId) {
                  throw new Error("No assistant message found!");
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await prisma.message.create({
                  data: {
                    chatId: id,
                    id: assistantId,
                    role: assistantMessage.role,
                    parts: {
                      toJSON: () => assistantMessage.parts,
                    },
                    attachments: {
                      toJSON: () =>
                        assistantMessage.experimental_attachments ?? [],
                    },
                    createdAt: new Date(),
                  },
                });
              } catch (_) {
                console.error("Failed to save chat");
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (err) => {
        console.log(err);
        return "Oops, an error occurred!";
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () => stream)
      );
    } else {
      return new Response(stream);
    }
  } catch (_) {
    console.log(_);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new Response("id is required", { status: 400 });
  }

  const session = await getSession();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (!chat) {
    return new Response("Not found", { status: 404 });
  }

  if (chat.visibility === "private" && chat.userId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new Response("No streams found", { status: 404 });
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new Response("No recent stream found", { status: 404 });
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream
  );

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  if (!stream) {
    const messages = await getMessagesByChatId({ id: chatId });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream, { status: 200 });
    }

    if (mostRecentMessage.role !== "assistant") {
      return new Response(emptyDataStream, { status: 200 });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return new Response(emptyDataStream, { status: 200 });
    }

    const restoredStream = createDataStream({
      execute: (buffer) => {
        buffer.writeData({
          type: "append-message",
          message: JSON.stringify(mostRecentMessage),
        });
      },
    });

    return new Response(restoredStream, { status: 200 });
  }

  return new Response(stream, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await getSession();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat?.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
