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
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
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
