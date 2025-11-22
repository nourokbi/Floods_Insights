import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";
import { useAuth } from "../context/AuthContext";

export default function useCommunityPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const { token } = useAuth();
  const mountedRef = useRef(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await axios.get(`${API_BASE}/api/reports`);
      const data = res.data;

      if (!mountedRef.current) return;

      if (data?.success) {
        const apiPosts = data.data.reports.map((item) => ({
          id: String(item.id),
          title: item.title,
          description: item.description,
          location: item.location_name,
          category: item.disaster_type,
          author: item.author_name,
          authorId: String(
            item.author_id ?? item.authorId ?? item.user_id ?? item.userId ?? ""
          ),
          timestamp: new Date(item.created_at).toLocaleString(),
          likes: Number(item.likes_count) || 0,
          comments: [],
          image: item.images?.length ? item.images[0] : null,
        }));

        // Mark the last two API posts as pinned
        const len = apiPosts.length;
        const withPinned = apiPosts.map((p, idx) => ({
          ...p,
          pinned: idx >= len - 2,
        }));
        setPosts(withPinned);

        // Fetch comments for all posts
        await fetchCommentsForPosts(apiPosts, token, setPosts);

        // Fetch user's bookmarks and likes if authenticated
        if (token) {
          await fetchUserBookmarks(token, setSavedPosts);
          await fetchUserLikes(token, setLikedPosts);
        }
      } else {
        setPosts([]);
        setFetchError(data?.message || "Failed to load posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (!mountedRef.current) return;
      setPosts([]);
      setFetchError(error?.message || "Failed to load posts");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    mountedRef.current = true;
    fetchPosts();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchPosts]);

  return {
    posts,
    setPosts,
    loading,
    fetchError,
    likedPosts,
    setLikedPosts,
    savedPosts,
    setSavedPosts,
    expandedComments,
    setExpandedComments,
    fetchPosts,
  };
}

// Helper functions
async function fetchCommentsForPosts(apiPosts, token, setPosts) {
  try {
    const commentFetches = apiPosts.map((p) =>
      axios
        .get(`${API_BASE}/api/comments/report/${p.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .then((r) => ({ id: p.id, data: r.data }))
        .catch((e) => {
          console.error("Error fetching comments for post", p.id, e);
          return { id: p.id, data: null };
        })
    );

    const commentsResults = await Promise.all(commentFetches);

    setPosts((prev) =>
      prev.map((p) => {
        const found = commentsResults.find((c) => c.id === p.id);
        if (found && found.data?.success) {
          const comments = (found.data.data.comments || []).map((c) => ({
            id: String(c.id),
            author: c.user_name || "Unknown",
            content: c.comment_text,
            timestamp: new Date(c.created_at).toLocaleString(),
          }));
          return { ...p, comments };
        }
        return p;
      })
    );
  } catch (err) {
    console.error("Error fetching comments for posts:", err);
  }
}

async function fetchUserBookmarks(token, setSavedPosts) {
  try {
    const bookmarked = await axios.get(
      `${API_BASE}/api/bookmarks/my?limit=1000`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (bookmarked?.data?.success) {
      const bookmarkedIds = new Set(
        bookmarked.data.data.bookmarks.map((b) => String(b.report_id))
      );
      setSavedPosts(bookmarkedIds);
    }
  } catch (err) {
    console.error("Error fetching user bookmarks:", err);
  }
}

async function fetchUserLikes(token, setLikedPosts) {
  try {
    const lk = await axios.get(`${API_BASE}/api/likes/my?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (lk?.data?.success) {
      const likedIds = new Set(
        lk.data.data.likes.map((l) => String(l.report_id))
      );
      setLikedPosts(likedIds);
    }
  } catch (err) {
    console.error("Error fetching user likes:", err);
  }
}
