const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(
      (data && data.message) || response.statusText || "Request failed"
    );
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

function withBody(method) {
  return (path, body, options = {}) =>
    request(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
}

export const apiClient = {
  get: (path, options) => request(path, { method: "GET", ...options }),
  post: withBody("POST"),
  put: withBody("PUT"),
  patch: withBody("PATCH"),
  delete: (path, options) => request(path, { method: "DELETE", ...options }),
};

export default apiClient;

