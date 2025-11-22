import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSearch, FiEyeOff, FiEye, FiTrash2, FiMessageSquare } from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatDateTime from "../../../utils/format_time";

export default function ContentModeration() {
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (activeTab === "posts") {
      loadPosts();
    } else {
      loadComments();
    }
  }, [activeTab, pagination.page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
      };

      const response = await adminService.getAllPosts(params);
      if (response.success) {
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Không thể tải danh sách bài đăng");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
      };

      const response = await adminService.getAllComments(params);
      if (response.success) {
        setComments(response.data.comments);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Không thể tải danh sách bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    if (activeTab === "posts") {
      loadPosts();
    } else {
      loadComments();
    }
  };

  const handleHidePost = async (post) => {
    const reason = prompt("Nhập lý do ẩn bài đăng:");
    if (!reason) return;

    try {
      const response = await adminService.hidePost(post.id, { reason });
      if (response.success) {
        toast.success("Đã ẩn bài đăng");
        loadPosts();
      }
    } catch (error) {
      console.error("Error hiding post:", error);
      toast.error(error.body?.message || "Không thể ẩn bài đăng");
    }
  };

  const handleShowPost = async (post) => {
    try {
      const response = await adminService.showPost(post.id);
      if (response.success) {
        toast.success("Đã hiện bài đăng");
        loadPosts();
      }
    } catch (error) {
      console.error("Error showing post:", error);
      toast.error(error.body?.message || "Không thể hiện bài đăng");
    }
  };

  const handleDeletePost = async (post) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa bài đăng "${post.title}"?`
      )
    ) {
      return;
    }

    try {
      const response = await adminService.deletePost(post.id);
      if (response.success) {
        toast.success("Đã xóa bài đăng");
        loadPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.body?.message || "Không thể xóa bài đăng");
    }
  };

  const handleDeleteComment = async (comment) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa bình luận này?"
      )
    ) {
      return;
    }

    try {
      const response = await adminService.deleteComment(comment.id);
      if (response.success) {
        toast.success("Đã xóa bình luận");
        loadComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error.body?.message || "Không thể xóa bình luận");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Kiểm duyệt nội dung
        </h1>
        <p className="text-slate-600 mt-1">
          Quản lý và kiểm duyệt bài đăng, bình luận
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab("posts");
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-4 py-3 border-b-2 transition ${
              activeTab === "posts"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            <span className="font-medium">Bài đăng</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("comments");
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-4 py-3 border-b-2 transition ${
              activeTab === "comments"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            <span className="font-medium">Bình luận</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "posts"
                  ? "Tìm kiếm bài đăng..."
                  : "Tìm kiếm bình luận..."
              }
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : activeTab === "posts" ? (
          posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Không có bài đăng nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Tiêu đề
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Tác giả
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Lớp học
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                        Bình luận
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Ngày tạo
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 text-sm text-slate-600">
                          #{post.id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 line-clamp-1">
                            {post.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {post.content}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-600">
                            {post.author?.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {post.author?.email}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-600">
                            {post.Classes?.className || "—"}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                            <FiMessageSquare className="h-4 w-4" />
                            {post.commentCount || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {formatDateTime(post.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleHidePost(post)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Ẩn bài đăng"
                            >
                              <FiEyeOff className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  trong tổng số {pagination.total} bài đăng
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Không có bình luận nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Nội dung
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Tác giả
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Bài đăng
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Ngày tạo
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr
                      key={comment.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-sm text-slate-600">
                        #{comment.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-800 line-clamp-3">
                          {comment.content}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">
                          {comment.author?.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {comment.author?.email}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {comment.PostClasses?.title || "—"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDateTime(comment.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteComment(comment)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                trong tổng số {pagination.total} bình luận
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

