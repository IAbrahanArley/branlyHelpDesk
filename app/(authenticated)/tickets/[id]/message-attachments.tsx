"use client";

import Image from "next/image";
import Link from "next/link";

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
}

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center gap-2">
          {attachment.fileType.startsWith("image/") ? (
            <div className="relative w-20 h-20 rounded-md overflow-hidden border">
              <Image
                src={attachment.fileUrl}
                alt={attachment.fileName}
                fill
                className="object-cover"
              />
            </div>
          ) : attachment.fileType.startsWith("video/") ? (
            <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-muted">
              <span className="text-2xl">🎥</span>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-muted">
              <span className="text-2xl">📎</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link
              href={attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate block"
            >
              {attachment.fileName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {(parseInt(attachment.fileSize) / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
