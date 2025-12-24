const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

function getAuthHeaders() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "x-access-token": token,
    };
  } catch {
    return {};
  }
}

/**
 * Upload ảnh đề thi
 * @param {File} file - File ảnh cần upload
 */
export async function uploadExamImage(file) {
  if (!file) {
    throw new Error("File là bắt buộc.");
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)");
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Kích thước file không được vượt quá 5MB");
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/upload/exam-image`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(
      (data && data.message) || response.statusText || "Upload failed"
    );
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

export default {
  uploadExamImage,
};

