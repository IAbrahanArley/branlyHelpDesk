"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";

interface AttachmentPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function AttachmentPreview({
  files,
  onRemove,
}: AttachmentPreviewProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return "";
    });
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Anexos ({files.length})</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative border rounded-md p-2 group hover:bg-muted transition-colors"
          >
            {file.type.startsWith("image/") && previewUrls[index] ? (
              <div className="relative aspect-square w-full">
                <Image
                  src={previewUrls[index]}
                  alt={file.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ) : (
              <div className="aspect-square w-full flex items-center justify-center bg-muted rounded">
                <p className="text-xs text-center text-muted-foreground">
                  {file.type.startsWith("video/") ? "🎥" : "📎"}
                </p>
              </div>
            )}
            <p className="text-xs mt-1 truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => onRemove(index)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
