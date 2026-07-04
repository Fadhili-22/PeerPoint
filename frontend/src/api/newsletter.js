import { apiFetch } from "./client";

export async function subscribeToNewsletter(email) {
  return apiFetch("/newsletter/subscribe", {
    method: "POST",
    body: { email },
    auth: false,
  });
}
