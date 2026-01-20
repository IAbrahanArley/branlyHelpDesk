"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createTicketMessageSchema, type CreateTicketMessageInput } from "@/src/lib/validators/ticket-message";
import { createTicketMessageAction } from "@/src/lib/actions/ticket-messages";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { FileInput } from "@/src/components/ui/file-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { AttachmentPreview } from "./attachment-preview";

interface ChatFormProps {
  ticketId: string;
}

export function ChatForm({ ticketId }: ChatFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTicketMessageInput>({
    resolver: zodResolver(createTicketMessageSchema),
    defaultValues: {
      ticketId,
    },
  });

  const handleFilesChange = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024;
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      return file.size <= maxSize && isValidType;
    });
    setSelectedFiles(validFiles);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateTicketMessageInput) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("message", data.message);
      formData.append("ticketId", ticketId);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const result = await createTicketMessageAction(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        reset();
        setSelectedFiles([]);
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Mensagem</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Digite sua mensagem..."
              rows={4}
              {...register("message")}
              disabled={isPending}
              className="resize-none"
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <FileInput
              id="files"
              multiple
              accept="image/*,video/*"
              disabled={isPending}
              onFilesChange={handleFilesChange}
              label="Anexos (opcional)"
            />
            <p className="text-xs text-muted-foreground">
              Máximo 10MB por arquivo. Formatos: imagens (JPEG, PNG, GIF, WEBP) e
              vídeos (MP4, WEBM, OGG, MOV)
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <AttachmentPreview
              files={selectedFiles}
              onRemove={handleRemoveFile}
            />
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar Mensagem"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
