"use client";

import { PaperclipIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UseAssistantHelpers } from "@ai-sdk/react";
import {
  ChangeEvent,
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Attachment } from "@/app/(dashboard)/analyzer/page";
import { StopIcon } from "../icons";
import { PreviewAttachment } from "./preview-attachment";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

interface IMultimodalInputProps {
  chatId: string;
  handleInputChange: UseAssistantHelpers["handleInputChange"];
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  setMessages: UseAssistantHelpers["setMessages"];
  submitMessage: UseAssistantHelpers["submitMessage"];
  attachments: Attachment[];
  status: UseAssistantHelpers["status"];
  input: UseAssistantHelpers["input"];
  setInput: UseAssistantHelpers["setInput"];
}

export function MultimodalInput({
  chatId,
  handleInputChange,
  setAttachments,
  attachments,
  status,
  input,
  setInput,
  submitMessage,
  setMessages,
}: IMultimodalInputProps) {
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload/beta", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        return data;
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 2
      }px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/analyzer/${chatId}`);
    submitMessage();
    setAttachments([]);
    setLocalStorageInput("");
    setInput("");
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    submitMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    setInput,
    chatId,
  ]);

  return (
    <div className="flex mx-auto gap-2 w-full md:max-w-3xl">
      <div className="relative w-full">
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            data-testid="attachments-preview"
            className="flex flex-row gap-2 overflow-x-auto items-end my-2"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.id} attachment={attachment} />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  filename: filename,
                  bytes: 0,
                  created_at: 0,
                  expires_at: null,
                  id: "",
                  object: "",
                  purpose: "assistants",
                  status: "",
                  status_details: null,
                }}
                isUploading={true}
              />
            ))}
          </div>
        )}

        <Textarea
          placeholder="Digite uma mensagem..."
          className="min-h-[48px] max-h-[300px] overflow-hidden resize-none rounded-2xl !text-base bg-muted pr-14 pl-4 py-3"
          rows={3}
          value={input}
          onChange={handleInputChange}
          ref={textareaRef}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();

              if (status !== "awaiting_message") {
                toast.error(
                  "Please wait for the model to finish its response!"
                );
              } else {
                submitForm();
              }
            }
          }}
        />

        <div className="absolute right-2 bottom-2">
          {status === "in_progress" ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <SendButton
              input={input}
              submitForm={submitForm}
              status={status}
              uploadQueue={uploadQueue}
            />
          )}
        </div>

        <input
          type="file"
          className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          tabIndex={-1}
        />

        <div className="absolute bottom-2 left-2">
          <AttachmentsButton fileInputRef={fileInputRef} status={status} />
        </div>
      </div>
    </div>
  );
}

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status?: UseAssistantHelpers["status"];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== "awaiting_message"}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseAssistantHelpers["setMessages"];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      type="submit"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  input,
  uploadQueue,
  submitForm,
  status,
}: {
  input: string;
  uploadQueue: Array<string>;
  submitForm: () => void;
  status: UseAssistantHelpers["status"];
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      type="submit"
      onClick={(event) => {
        event.preventDefault();
        if (status !== "awaiting_message") {
          toast.error("Please wait for the model to finish its response!");
        } else {
          submitForm();
        }
      }}
      disabled={
        (input.length === 0 && uploadQueue.length > 0) ||
        status !== "awaiting_message"
      }
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
