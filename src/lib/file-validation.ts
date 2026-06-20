const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "ico"]);

export function validateImageFile(file: File, maxSizeMb = 5): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!IMAGE_TYPES.has(file.type.toLowerCase()) || !IMAGE_EXTENSIONS.has(extension)) {
    return "Formato não aceito. Use JPG, PNG, WEBP, GIF ou ICO.";
  }

  if (file.size === 0) return "O arquivo está vazio.";
  if (file.size > maxSizeMb * 1024 * 1024) return `A imagem deve ter no máximo ${maxSizeMb} MB.`;

  return null;
}
