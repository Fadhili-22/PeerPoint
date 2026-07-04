export const MAX_UPLOAD_SIZE_MB = 5;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

export function validateImageFile(file) {
  if (!file) {
    return "No file selected.";
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `Image must be ${MAX_UPLOAD_SIZE_MB} MB or smaller.`;
  }

  return null;
}
