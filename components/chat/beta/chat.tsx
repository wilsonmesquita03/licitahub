"use client";

import { Messages } from "@/components/chat/beta/messages";
import { MultimodalInput } from "@/components/chat/beta/multimodal-input";
import { useAssistant } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { Session } from "better-auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Attachment {
  object: string;
  id: string;
  purpose: "assistants";
  filename: string;
  bytes: number;
  created_at: number;
  expires_at: number | null;
  status: string;
  status_details: null;
}

interface IChatProps {
  id: string;
  initialMessages: Array<UIMessage>;
  isReadonly: boolean;
  session: Session;
}

export default function Chat({ id, initialMessages }: IChatProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const {
    status,
    messages,
    input,
    submitMessage,
    handleInputChange,
    setInput,
    setMessages,
  } = useAssistant({
    api: "/api/chat/beta",
    body: { attachments, id },
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-61px)] min-w-0 bg-background">
      <Messages
        chatId={id}
        messages={[...initialMessages, ...messages]}
        status={status}
        setMessages={setMessages}
      />

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <div className="relative w-full flex flex-col gap-4">
          <MultimodalInput
            chatId={id}
            handleInputChange={handleInputChange}
            setAttachments={setAttachments}
            attachments={attachments}
            status={status}
            input={input}
            submitMessage={submitMessage}
            setInput={setInput}
            setMessages={setMessages}
          />
        </div>
      </form>
    </div>
  );
}
