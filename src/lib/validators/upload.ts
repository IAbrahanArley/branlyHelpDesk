import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

export const uploadFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Arquivo deve ter no máximo 10MB",
    })
    .refine(
      (file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type) ||
        ACCEPTED_VIDEO_TYPES.includes(file.type),
      {
        message:
          "Apenas imagens (JPEG, PNG, GIF, WEBP) e vídeos (MP4, WEBM, OGG, MOV) são permitidos",
      }
    ),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
