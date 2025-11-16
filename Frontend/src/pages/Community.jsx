import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AddPostForm from "../components/Community/AddPostForm";
import PostCard from "../components/Community/PostCard";
import Sidebar from "../components/Community/Sidebar";
import "./Community.css";
import RequireAuth from "../components/Auth/RequireAuth";
// API hosts: keep both local and remote here so we can switch easily
const API_HOSTS = {
  local: "http://localhost:5000",
  onrender: "https://kartak-demo-od0f.onrender.com",
};

// Active base URL — change to API_HOSTS.onrender to use the remote API
const API_BASE = API_HOSTS.local;

export default function Community() {
  const navigate = useNavigate();
  // posts loaded from API
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const { token, user } = useAuth();
  const location = useLocation();

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
          timestamp: new Date(item.created_at).toLocaleString(),
          likes: Number(item.likes_count) || 0,
          comments: [], // will populate immediately after
          image: item.images?.length ? item.images[0] : null,
        }));

        setPosts(apiPosts);

        // Fetch comments for each post so counts are available immediately
        try {
          const commentFetches = apiPosts.map((p) =>
            axios
              .get(`${API_BASE}/api/comments/report/${p.id}`, {
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              })
              .then((r) => ({ id: p.id, data: r.data }))
              .catch((e) => {
                console.error("Error fetching comments for post", p.id, e);
                return { id: p.id, data: null };
              })
          );

          const commentsResults = await Promise.all(commentFetches);

          // attach comments to posts
          setPosts((prev) =>
            prev.map((p) => {
              const found = commentsResults.find((c) => c.id === p.id);
              if (found && found.data?.success) {
                const comments = (found.data.data.comments || []).map((c) => ({
                  id: String(c.id),
                  author: c.user_name || c.user_name || "Unknown",
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

        // if authenticated, also load user's bookmarks to mark saved posts
        if (token) {
          try {
            const bookmarked = await axios.get(
              `${API_BASE}/api/bookmarks/my?limit=1000`,
              {
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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
          // also fetch likes for the current user so liked posts show active
          try {
            const lk = await axios.get(`${API_BASE}/api/likes/my?limit=1000`, {
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
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

  const handleAddPost = async (formData) => {
    try {
      // Accept either FormData (from AddPostForm) or a plain object
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

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.post(`${API_BASE}/api/reports`, payload, {
        headers,
      });

      const data = res.data;

      if (data.success) {
        const newPost = data.data.report; // returned post from API

        // Format it into your UI post structure
        const formatted = {
          id: String(newPost.id),
          title: newPost.title,
          description: newPost.description,
          location: newPost.location_name,
          category: newPost.disaster_type,
          author:
            (user && (user.name || user.username)) ||
            newPost.author_name ||
            "You",
          authorId: user?.id ?? newPost.author_id ?? null,
          author_profile: user ?? null,
          timestamp: new Date(newPost.created_at).toLocaleString(),
          likes: Number(newPost.likes_count) || 0,
          comments: [],
          image: newPost.images?.length ? newPost.images[0] : null,
          link: newPost.link || "",
          latitude: String(newPost.latitude ?? newPost.lat ?? "0"),
          longitude: String(newPost.longitude ?? newPost.lon ?? "0"),
        };

        setPosts((prev) => [formatted, ...prev]);
        return formatted;
      }

      throw new Error(data?.message || "Failed to create post");
    } catch (error) {
      console.error("Error adding post:", error);
      throw error;
    }
  };
  // Handlers (will map to API calls later)
  const handleLike = async (postId) => {
    if (!user || !token) {
      // redirect to login preserving location
      navigate("/login", { state: { from: location } });
      return;
    }

    // optimistic update
    const updated = new Set(likedPosts);
    const willLike = !updated.has(postId);
    if (willLike) updated.add(postId);
    else updated.delete(postId);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: willLike ? p.likes + 1 : Math.max(0, p.likes - 1) }
          : p
      )
    );
    setLikedPosts(updated);

    try {
      await axios.post(
        `${API_BASE}/api/likes/toggle`,
        { report_id: Number(postId) },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      // revert optimistic update on error
      const revert = new Set(likedPosts);
      if (willLike) revert.delete(postId);
      else revert.add(postId);
      setLikedPosts(revert);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes: willLike ? Math.max(0, p.likes - 1) : p.likes + 1 }
            : p
        )
      );
    }
  };
  const handleSave = async (postId) => {
    if (!user || !token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // optimistic toggle
    const updated = new Set(savedPosts);
    const willSave = !updated.has(postId);
    if (willSave) updated.add(postId);
    else updated.delete(postId);
    setSavedPosts(updated);

    try {
      await axios.post(
        `${API_BASE}/api/bookmarks/toggle`,
        { report_id: Number(postId) },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      // revert
      const revert = new Set(savedPosts);
      if (willSave) revert.delete(postId);
      else revert.add(postId);
      setSavedPosts(revert);
    }
  };
  const toggleComments = (postId) => {
    const updated = new Set(expandedComments);
    updated.has(postId) ? updated.delete(postId) : updated.add(postId);
    setExpandedComments(updated);
  };
  const handleAddComment = (postId, commentText) => {
    if (!commentText) return;
    // If not authenticated, redirect to login
    if (!user || !token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Optimistic comment with temporary id
    const tempId = `tmp-${Date.now()}`;
    const newComment = {
      id: tempId,
      author: (user && (user.name || user.username)) || "You",
      content: commentText,
      timestamp: "Just now",
      pending: true,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );

    // Send to server
    (async () => {
      try {
        const res = await axios.post(
          `${API_BASE}/api/comments`,
          { report_id: Number(postId), comment_text: commentText },
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const data = res.data;
        if (data?.success && data.data?.comment) {
          const serverComment = data.data.comment;
          // normalize comment shape for UI
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
              serverComment.created_at || serverComment.createdAt || Date.now()
            ).toLocaleString(),
          };

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
        } else {
          // server didn't return comment; remove temp and add a fallback final comment
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    comments: p.comments.map((c) =>
                      c.id === tempId
                        ? {
                            ...c,
                            pending: false,
                          }
                        : c
                    ),
                  }
                : p
            )
          );
        }
      } catch (err) {
        console.error("Error posting comment:", err);
        // revert optimistic comment on error
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => c.id !== tempId) }
              : p
          )
        );
      }
    })();
  };

  const mostLikedPosts = [...posts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);
  useEffect(() => {
    // Placeholder for future fetch usage. Keep empty now.
  }, []);
  return (
    <RequireAuth>
      <div className="community-page">
        <header className="community-header">
          <div className="header-content">
            <button className="back-button" onClick={() => navigate("/")}>
              ← Back to Home
            </button>
            <h1 className="community-title">Community Hub</h1>
            <p className="community-subtitle">
              Share experiences, alerts, and support each other
            </p>
          </div>
        </header>
        <div className="community-container">
          <main className="posts-section">
            {/* Loading / error / posts */}
            {loading ? (
              <div className="posts-loading">Loading posts…</div>
            ) : fetchError ? (
              <div className="posts-error">
                <p>Failed to load posts: {fetchError}</p>
                <button
                  className="refresh-button"
                  onClick={() => {
                    fetchPosts();
                  }}
                >
                  Refresh
                </button>
              </div>
            ) : null}

            {!loading && !fetchError && posts.length === 0 && (
              <div className="no-posts">No posts yet.</div>
            )}

            <AddPostForm onAddPost={handleAddPost} />
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPosts.has(post.id)}
                isSaved={savedPosts.has(post.id)}
                commentsExpanded={expandedComments.has(post.id)}
                onLike={() => handleLike(post.id)}
                onSave={() => handleSave(post.id)}
                onToggleComments={() => toggleComments(post.id)}
                onAddComment={(text) => handleAddComment(post.id, text)}
              />
            ))}
          </main>
          <aside className="community-sidebar">
            <Sidebar
              mostLikedPosts={mostLikedPosts}
              onAnalyze={() => navigate("/analyze")}
            />
          </aside>
        </div>
      </div>
    </RequireAuth>
  );
}
