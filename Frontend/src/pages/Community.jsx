/* eslint-disable no-unused-vars */
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RequireAuth from "../components/Auth/RequireAuth";
import CommunityHeader from "../components/community/CommunityHeader";
import AddPostForm from "../components/community/AddPostForm";
import PinnedSection from "../components/community/PinnedSection";
import PostsList from "../components/community/PostsList";
import Sidebar from "../components/community/Sidebar";
import ConfirmModal from "../components/UI/ConfirmModal";
import useCommunityPosts from "../hooks/useCommunityPosts";
import usePostActions from "../hooks/usePostsActions";
import useMostLikedPosts from "../hooks/useMostLikedPosts";
import "./Community.css";

export default function Community() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Custom hooks handle all data fetching and state
  const {
    posts,
    loading,
    fetchError,
    likedPosts,
    savedPosts,
    expandedComments,
    setPosts,
    setLikedPosts,
    setSavedPosts,
    setExpandedComments,
    fetchPosts,
  } = useCommunityPosts();

  const {
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
  } = usePostActions({
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
  });

  const { mostLikedPosts, mostLikedLoading } = useMostLikedPosts();

  const pinnedPosts = posts.filter((p) => p.pinned);
  const regularPosts = posts.filter((p) => !p.pinned);

  return (
    <RequireAuth>
    <div className="community-page">
      <CommunityHeader onBack={() => navigate("/")} />

      <div className="community-container">
        <main className="posts-section">
          <AddPostForm onAddPost={handleAddPost} />

          {pinnedPosts.length > 0 && (
            <PinnedSection
              posts={pinnedPosts}
              likedPosts={likedPosts}
              savedPosts={savedPosts}
              expandedComments={expandedComments}
              user={user}
              onDelete={openConfirmDelete}
              onLike={handleLike}
              onSave={handleSave}
              onToggleComments={toggleComments}
              onAddComment={handleAddComment}
            />
          )}

          <PostsList
            posts={regularPosts}
            loading={loading}
            fetchError={fetchError}
            likedPosts={likedPosts}
            savedPosts={savedPosts}
            expandedComments={expandedComments}
            user={user}
            onRefresh={fetchPosts}
            onDelete={openConfirmDelete}
            onLike={handleLike}
            onSave={handleSave}
            onToggleComments={toggleComments}
            onAddComment={handleAddComment}
          />
        </main>

        <aside className="community-sidebar">
          <Sidebar
            mostLikedPosts={mostLikedPosts}
            mostLikedLoading={mostLikedLoading}
            onAnalyze={() => navigate("/analyze")}
          />
        </aside>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete post"
        description="Are you sure you want to delete this post? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
    </RequireAuth>
  );
}
