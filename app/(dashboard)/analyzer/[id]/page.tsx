import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { UIMessage } from "ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Message } from "@/prisma/generated/prisma";
import Chat from "@/components/chat/beta/chat";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await prisma.chat.findUnique({ where: { id } });

  if (!chat) {
    return notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  const messagesFromDb = await prisma.message.findMany({
    where: {
      chatId: chat.id,
    },
  });

  function convertToUIMessages(messages: Array<Message>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: "",
      createdAt: message.createdAt,
      experimental_attachments: Array.isArray(message.attachments)
        ? message.attachments
        : JSON.parse(message.attachments as string) ?? [],
    }));
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        session={session.session}
        isReadonly={false}
      />
    </>
  );
}
