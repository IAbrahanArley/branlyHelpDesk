"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createTicketSchema, type CreateTicketInput } from "@/src/lib/validators/ticket";
import { createTicketAction } from "@/src/lib/actions/tickets";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Select } from "@/src/components/ui/select";
import { FileInput } from "@/src/components/ui/file-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { TicketPriority } from "@/src/db/schema/enums";
import { AttachmentPreview } from "../[id]/attachment-preview";

const priorityLabels = {
  [TicketPriority.LOW]: "Baixa",
  [TicketPriority.MEDIUM]: "Média",
  [TicketPriority.HIGH]: "Alta",
  [TicketPriority.URGENT]: "Urgente",
};

export function CreateTicketForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: TicketPriority.MEDIUM,
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

  const onSubmit = async (data: CreateTicketInput) => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("priority", data.priority);

        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        const result = await createTicketAction(formData);

        if (result?.error) {
          setError(result.error);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro inesperado ao criar ticket. Tente novamente."
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Descreva brevemente o problema"
              {...register("title")}
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente o problema que está enfrentando..."
              rows={8}
              {...register("description")}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade *</Label>
            <Select
              id="priority"
              {...register("priority")}
              disabled={isPending}
            >
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {errors.priority && (
              <p className="text-sm text-destructive">
                {errors.priority.message}
              </p>
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

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Criando..." : "Criar Ticket"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/tickets")}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
