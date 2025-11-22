import { apiClient } from "./apiClient";

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * Tạo bài đăng mới trong lớp
 * @param {Object} payload - { classId, title, post }
 */
export function createPost(payload) {
  if (!payload?.classId) {
    throw new Error("classId là bắt buộc.");
  }
  if (!payload?.title?.trim()) {
    throw new Error("title là bắt buộc.");
  }
  if (!payload?.post?.trim()) {
    throw new Error("post (nội dung) là bắt buộc.");
  }

  return apiClient.post("/api/posts/create", {
    classId: payload.classId,
    title: payload.title,
    post: payload.post,
  });
}

/**
 * Lấy danh sách bài đăng của lớp
 * @param {number|string} classId - ID của lớp
 */
export function getClassPosts(classId) {
  if (!classId) {
    throw new Error("classId là bắt buộc.");
  }

  return apiClient.get(`/api/classes/posts/${classId}`);
}

/**
 * Cập nhật bài đăng
 * @param {number|string} postId - ID của bài đăng
 * @param {Object} payload - { title, post }
 */
export function updatePost(postId, payload) {
  if (!postId) {
    throw new Error("postId là bắt buộc.");
  }

  return apiClient.post(`/api/posts/update/${postId}`, {
    title: payload.title,
    post: payload.post,
  });
}

/**
 * Xóa bài đăng
 * @param {number|string} postId - ID của bài đăng
 */
export function deletePost(postId) {
  if (!postId) {
    throw new Error("postId là bắt buộc.");
  }

  return apiClient.delete(`/api/posts/${postId}`);
}

/**
 * Lấy danh sách bình luận của bài đăng
 * @param {number|string} postId - ID của bài đăng
 */
export function getPostComments(postId) {
  if (!postId) {
    throw new Error("postId là bắt buộc.");
  }

  return apiClient.get(`/api/posts/comment/${postId}`);
}

/**
 * Thêm bình luận vào bài đăng
 * @param {Object} payload - { postId, comment }
 */
export function addPostComment(payload) {
  if (!payload?.postId) {
    throw new Error("postId là bắt buộc.");
  }
  if (!payload?.comment?.trim()) {
    throw new Error("comment là bắt buộc.");
  }

  return apiClient.post("/api/posts/comment", {
    postId: payload.postId,
    comment: payload.comment,
  });
}

export default {
  createPost,
  getClassPosts,
  updatePost,
  deletePost,
  getPostComments,
  addPostComment,
};

