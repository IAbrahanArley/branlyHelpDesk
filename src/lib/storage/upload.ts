import { createClient } from "@/src/lib/supabase/server";

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

export async function uploadFileToStorage(
  file: File,
  ticketId: string,
  messageId: string
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  const supabase = await createClient();

  if (file.size > MAX_FILE_SIZE) {
    return {
      url: null,
      error: "Arquivo deve ter no máximo 10MB",
    };
  }

  const isValidType =
    ACCEPTED_IMAGE_TYPES.includes(file.type) ||
    ACCEPTED_VIDEO_TYPES.includes(file.type);

  if (!isValidType) {
    return {
      url: null,
      error:
        "Apenas imagens (JPEG, PNG, GIF, WEBP) e vídeos (MP4, WEBM, OGG, MOV) são permitidos",
    };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `tickets/${ticketId}/${messageId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("ticket-attachments")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return {
      url: null,
      error: error.message,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("ticket-attachments").getPublicUrl(data.path);

  return {
    url: publicUrl,
    error: null,
  };
}

export async function deleteFileFromStorage(filePath: string): Promise<void> {
  const supabase = await createClient();
  await supabase.storage.from("ticket-attachments").remove([filePath]);
}

