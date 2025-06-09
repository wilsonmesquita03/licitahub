import { Attachment } from "@/app/(dashboard)/analyzer/page";
import { LoaderIcon } from "lucide-react";
import Image from "next/image";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { filename } = attachment;
  const ext = filename.split(".").pop() || "";
  const supportedExt = ["docx", "pdf"];

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {supportedExt.includes(ext) && !isUploading && (
          <Image
            src={`/ext/${ext}.png`}
            width={16}
            height={16}
            alt="extension"
          />
        )}
        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-16 truncate">{filename}</div>
    </div>
  );
};
