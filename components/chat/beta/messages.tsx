// app/components/MessagesLayout.tsx

import { UseAssistantHelpers } from "@ai-sdk/react";
import { PreviewMessage } from "./preview-message";
import { ThinkingMessage } from "../message";
import { Greeting } from "../greeting";
import { motion } from "framer-motion";

interface IMessagesProps {
  chatId: string;
  messages: UseAssistantHelpers["messages"];
  status: UseAssistantHelpers["status"];
  setMessages: UseAssistantHelpers["setMessages"];
}

export function Messages({ messages, status }: IMessagesProps) {
  return (
    <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative">
      {messages.length === 0 && <Greeting />}
      {/* Lista de mensagens */}
      {/* Aqui você pode mapear mensagens mockadas se quiser */}
      {messages.map((message) => (
        <PreviewMessage key={message.id} message={message} />
      ))}

      {status === "in_progress" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div className="shrink-0 min-w-[24px] min-h-[24px]" />
    </div>
  );
}
