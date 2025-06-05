"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";

import { myProvider } from "@/lib/ai/providers";
import { VisibilityType } from "@/components/chat/visibility-selector";
import { prisma } from "@/lib/prisma";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel("title-model"),
    system: `\n
      - você irá gerar um título curto com base na primeira mensagem que um usuário usa para iniciar uma conversa  
      - certifique-se de que o título tenha no máximo 80 caracteres  
      - o título deve ser um resumo da mensagem do usuário  
      - não use aspas nem dois-pontos`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await prisma.message.findMany({
    where: { id },
    take: 1,
  });

  await prisma.message.deleteMany({
    where: { chatId: message.chatId, createdAt: { gt: message.createdAt } },
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      visibility,
    },
  });
}
