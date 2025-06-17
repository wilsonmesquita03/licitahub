// @ts-nocheck
// app/components/MessageLayout.tsx

import { cn, sanitizeText } from "@/lib/utils";
import { Message } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";
import { Markdown } from "../markdown";
import Image from "next/image";

interface MessageLayoutProps {
  message: Message;
}

export function PreviewMessage({ message }: MessageLayoutProps) {
  const mode: "view" | "edit" = "view";
  const requiresScrollPadding = false;

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": false,
              "group-data-[role=user]/message:w-fit": true,
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="w-8 h-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div data-testid={`message-attachments`}>
                  {message.experimental_attachments.map((attachment) => (
                    <div
                      key={attachment?.id}
                      className="flex gap-2 rounded-full"
                    >
                      <div className="w-8 h-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
                        <Image
                          src="/ext/pdf.png"
                          width={14}
                          height={14}
                          alt=""
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold">
                          {attachment?.filename}
                        </p>
                        <p className="text-xs">
                          {attachment.filename?.split(".").pop()?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {message.content && (
              <div
                data-testid="message-content"
                className={cn("flex flex-col gap-4", {
                  "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                    message.role === "user",
                })}
              >
                <Markdown>{message.content}</Markdown>
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row justify-end">
                      {/* message.role === "user" && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      ) */}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4 w-fit", {
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        {part.text && <Markdown>{part.text}</Markdown>}
                      </div>
                    </div>
                  );
                }

                {
                  /*
                  if (mode === "edit") {
                    return (
                      <div key={key} className="flex flex-row gap-2 items-start">
                        <div className="size-8" />
  
                        <MessageEditor
                          key={message.id}
                          message={message}
                          setMode={setMode}
                          setMessages={setMessages}
                          reload={reload}
                        />
                      </div>
                    );
                  }
                  */
                }
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
