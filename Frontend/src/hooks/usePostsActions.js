/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/UI/ToastProvider";
import { formatNewPost } from "../utils/postFormatters";

export default function usePostActions({
  user,
  navigate,
  location,
  posts,
  setPosts,
  likedPosts,
  savedPosts,
  expandedComments,
  setLikedPosts,
  setSavedPosts,
  setExpandedComments,
}) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const handleAddPost = async (formData) => {
    try {
      let payload = formData;
      if (!(formData instanceof FormData)) {
        const fd = new FormData();
        fd.append("title", formData.title || "");
        fd.append("description", formData.description || "");
        fd.append(
          "location_name",
          formData.location_name || formData.location || ""
        );
        fd.append(
          "disaster_type",
          formData.disaster_type || formData.category || "flood"
        );
        fd.append(
          "longitude",
          formData.longitude ? String(formData.longitude) : "0"
        );
        fd.append(
          "latitude",
          formData.latitude ? String(formData.latitude) : "0"
        );
        fd.append("status", formData.status || "active");
        fd.append("link", formData.link || "");
        if (formData.images && Array.isArray(formData.images)) {
          formData.images.forEach((f) => fd.append("images", f));
        }
        payload = fd;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${API_BASE}/api/reports`, payload, {
        headers,
      });
      const data = res.data;

      if (data.success) {
        const formatted = formatNewPost(data.data.report, user);

        // Insert after pinned posts
        setPosts((prev) => {
          const pinned = prev.filter((p) => p.pinned);
          const others = prev.filter((p) => !p.pinned);
          return [...pinned, formatted, ...others];
        });

        showToast({ message: "Post added", type: "success", duration: 3000 });
        return formatted;
      }

      throw new Error(data?.message || "Failed to create post");
    } catch (error) {
      console.error("Error adding post:", error);
      showToast({
        message: "Failed to add post",
        type: "error",
        duration: 3000,
      });
      throw error;
    }
  };

  const openConfirmDelete = (postId) => {
    if (!user || !token) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setPostToDelete(postId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const postId = postToDelete;
    setConfirmOpen(false);
    setPostToDelete(null);

    try {
      await axios.delete(`${API_BASE}/api/reports/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast({ message: "Post deleted", type: "error", duration: 3000 });
    } catch (err) {
      console.error("Error deleting post:", err);
      showToast({
        message: "Failed to delete post",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleLike = async (postId) => {
    if (!user || !token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Determine if we're liking or unliking
    const willLike = !likedPosts.has(postId);

    // Create new Set and update state immediately (optimistic update)
    const newLikedPosts = new Set(likedPosts);
    if (willLike) {
      newLikedPosts.add(postId);
    } else {
      newLikedPosts.delete(postId);
    }

    // Update the liked posts state
    setLikedPosts(newLikedPosts);

    // Optimistic UI update for like count
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: willLike ? p.likes + 1 : Math.max(0, p.likes - 1) }
          : p
      )
    );

    try {
      await axios.post(
        `${API_BASE}/api/likes/toggle`,
        { report_id: Number(postId) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error toggling like:", err);

      // Revert the liked posts state on error
      const revertLikedPosts = new Set(likedPosts);
      if (!willLike) {
        revertLikedPosts.add(postId);
      } else {
        revertLikedPosts.delete(postId);
      }
      setLikedPosts(revertLikedPosts);

      // Revert the like count
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes: willLike ? Math.max(0, p.likes - 1) : p.likes + 1 }
            : p
        )
      );

      showToast({
        message: "Failed to update like",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleSave = async (postId) => {
    if (!user || !token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Determine if we're saving or unsaving
    const willSave = !savedPosts.has(postId);

    // Create new Set and update state immediately (optimistic update)
    const newSavedPosts = new Set(savedPosts);
    if (willSave) {
      newSavedPosts.add(postId);
    } else {
      newSavedPosts.delete(postId);
    }

    // Update the saved posts state
    setSavedPosts(newSavedPosts);

    try {
      await axios.post(
        `${API_BASE}/api/bookmarks/toggle`,
        { report_id: Number(postId) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast({
        message: willSave ? "Post saved" : "Post unsaved",
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error toggling bookmark:", err);

      // Revert the saved posts state on error
      const revertSavedPosts = new Set(savedPosts);
      if (!willSave) {
        revertSavedPosts.add(postId);
      } else {
        revertSavedPosts.delete(postId);
      }
      setSavedPosts(revertSavedPosts);

      showToast({
        message: "Failed to update bookmark",
        type: "error",
        duration: 3000,
      });
    }
  };

  const toggleComments = (postId) => {
    // Create new Set with the updated state
    const newExpandedComments = new Set(expandedComments);
    if (newExpandedComments.has(postId)) {
      newExpandedComments.delete(postId);
    } else {
      newExpandedComments.add(postId);
    }

    // Update the expanded comments state
    setExpandedComments(newExpandedComments);
  };

  const handleAddComment = (postId, commentText) => {
    if (!commentText || !commentText.trim()) return;
    if (!user || !token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const tempId = `tmp-${Date.now()}`;
    const newComment = {
      id: tempId,
      author: (user && (user.name || user.username)) || "You",
      content: commentText,
      timestamp: "Just now",
      pending: true,
    };

    // Optimistically add the comment
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );

    // Auto-expand comments when adding a new one
    const newExpandedComments = new Set(expandedComments);
    newExpandedComments.add(postId);
    setExpandedComments(newExpandedComments);

    (async () => {
      try {
        const res = await axios.post(
          `${API_BASE}/api/comments`,
          { report_id: Number(postId), comment_text: commentText },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data;
        if (data?.success && data.data?.comment) {
          const serverComment = data.data.comment;
          const formatted = {
            id: String(serverComment.id),
            author:
              serverComment.author_name ||
              (user && (user.name || user.username)) ||
              "You",
            content:
              serverComment.comment_text ||
              serverComment.content ||
              commentText,
            timestamp: new Date(
              serverComment.created_at || Date.now()
            ).toLocaleString(),
          };

          // Replace the temporary comment with the server response
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    comments: p.comments.map((c) =>
                      c.id === tempId ? formatted : c
                    ),
                  }
                : p
            )
          );

          showToast({
            message: "Comment added",
            type: "success",
            duration: 3000,
          });
        }
      } catch (err) {
        console.error("Error posting comment:", err);

        // Remove the temporary comment on error
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => c.id !== tempId) }
              : p
          )
        );

        showToast({
          message: "Failed to add comment",
          type: "error",
          duration: 3000,
        });
      }
    })();
  };

  return {
    handleAddPost,
    handleLike,
    handleSave,
    handleAddComment,
    toggleComments,
    confirmOpen,
    setConfirmOpen,
    postToDelete,
    openConfirmDelete,
    handleConfirmDelete,
  };
}
