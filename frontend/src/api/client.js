const API_BASE = import.meta.env.VITE_API_URL ?? "";

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  constructor(status, detail, fieldErrors = {}) {
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg).join("; ")
          : "Request failed";
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }
}

function parseFieldErrors(detail) {
  if (!Array.isArray(detail)) return {};
  return detail.reduce((acc, item) => {
    const field = item.loc?.[item.loc.length - 1];
    if (field && typeof field === "string") {
      acc[field] = item.msg;
    }
    return acc;
  }, {});
}

export async function apiFetch(path, { method = "GET", body, auth = true, headers = {} } = {}) {
  const requestHeaders = { ...headers };

  if (body !== undefined && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData || body instanceof URLSearchParams
            ? body
            : JSON.stringify(body),
    });
  } catch (error) {
    const target = API_BASE ? `${API_BASE}${path}` : path;
    const hint = API_BASE
      ? "Could not reach the API server. Confirm the backend is running and VITE_API_URL is set."
      : "VITE_API_URL is not configured. Set it in frontend/.env.development and restart the dev server.";
    throw new ApiError(
      0,
      error?.message?.includes("Failed to fetch")
        ? `Network error while calling ${target}. ${hint}`
        : `Network error while calling ${target}. Please check your connection and try again.`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    const detail = data?.detail ?? data?.message ?? response.statusText;
    throw new ApiError(response.status, detail, parseFieldErrors(data?.detail));
  }

  if (response.status === 204) return null;
  return data;
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}
