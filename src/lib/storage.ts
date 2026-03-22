import { supabase } from "./supabase";

async function compressImage(file: File | Blob, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  // If not an image, return as is
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
  });
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob | string // string for base64
): Promise<string> {
  let fileToUpload: File | Blob;

  if (typeof file === "string" && file.startsWith("data:")) {
    // Convert base64 to Blob
    const response = await fetch(file);
    fileToUpload = await response.blob();
  } else {
    fileToUpload = file as File | Blob;
  }

  // Compress if it's an image
  if (fileToUpload.type.startsWith("image/")) {
    try {
      fileToUpload = await compressImage(fileToUpload);
    } catch (e) {
      console.warn("Compression failed, uploading original", e);
    }
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, fileToUpload, {
    upsert: true,
  });

  if (error) throw error;
  return data.path;
}

export function getFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function deleteFolder(bucket: string, folderPath: string): Promise<void> {
  const { data, error: listError } = await supabase.storage.from(bucket).list(folderPath);
  if (listError) throw listError;
  if (!data || data.length === 0) return;

  const pathsToDelete = data.map((file) => `${folderPath}/${file.name}`);
  const { error: deleteError } = await supabase.storage.from(bucket).remove(pathsToDelete);
  if (deleteError) throw deleteError;
}
