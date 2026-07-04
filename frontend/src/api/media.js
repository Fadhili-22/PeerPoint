import { apiFetch } from "./client";

export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/media/upload", {
    method: "POST",
    body: formData,
  });
}
