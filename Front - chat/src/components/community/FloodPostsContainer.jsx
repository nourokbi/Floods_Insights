import React from "react"; // شيلنا useState لأنه هيجي من الأب
import {
    Heart,
    MessageCircle,
    Bookmark,
    Share2,
    Clock,
    MapPin,
} from "lucide-react";

import CommentsSection from "./CommentsSection";

// الصور
import flood1 from "../../assets/post/flood1.png";
import flood2 from "../../assets/post/flood2.png";
import flood3 from "../../assets/post/flood3.png";
import flood4 from "../../assets/post/flood4.png";
import flood5 from "../../assets/post/flood5.png";

const getCategoryBadge = (category) => {
    const badges = {
        flood: { text: "Flood Alert", class: "badge-flood" },
        earthquake: { text: "Earthquake", class: "badge-earthquake" },
        general: { text: "Community", class: "badge-general" },
    };
    return badges[category] || badges.general;
};

// =======================================================
// 1. ضفنا export عشان نقدر نستخدم البيانات دي في Community.jsx
// =======================================================
export const INITIAL_POSTS = [
    {
        id: 101,
        author: "Safety Insights Admin",
        timestamp: "2 hours ago",
        location: "Global Awareness",
        category: "flood",
        title: "Understanding Floods",
        description: "A flood occurs when water overflows from a river or water channel, inundating normally dry land. While floods can be beneficial (like enriching floodplains), Flash Floods resulting from short, heavy rainfall are often catastrophic, causing severe damage to life and property.",
        image: flood1,
        likes: 15,
        comments: [],
    },
    {
        id: 102,
        author: "Weather Alert System",
        timestamp: "1 day ago",
        location: "Wadi Flash Zone",
        category: "flood",
        title: "Warning: Flash Floods",
        description: "A flash flood is a sudden, rapid flow of turbulent, muddy water rushing down wadis or valleys. They are caused by intense rainfall or rapid snowmelt, and waters typically rise and fall within a few hours or days. The resulting walls of water can be powerful enough to destroy roads and bridges. Always be prepared!",
        image: flood2,
        likes: 22,
        comments: [{ id: 1, author: "UserA", content: "Very important!", timestamp: "1 day ago" }],
    },
    {
        id: 103,
        author: "Infrastructure Planning",
        timestamp: "2 days ago",
        location: "Urban Control",
        category: "flood",
        title: "Controlling Floods",
        description: "Flood control measures include channel improvements, building protective levees/dams, and implementing programs to maintain soil and vegetation cover to slow and absorb runoff water. As an individual, do not build in floodplains and follow civil defense warnings closely.",
        image: flood3,
        likes: 8,
        comments: [],
    },
    {
        id: 104,
        author: "NOAA NSSL Facts",
        timestamp: "5 days ago",
        location: "Road Safety",
        category: "flood",
        title: "Turn Around, Don't Drown!",
        description: "It takes only six inches of moving water to sweep a person off their feet, and two feet (24 inches) to sweep away most vehicles, including SUVs and pickup trucks! The majority of flood fatalities occur when people drive into flooded roads. NEVER drive or walk through floodwaters. Remember: Turn Around, Don't Drown.",
        image: flood4,
        likes: 12,
        comments: [{ id: 1, author: "Driver", content: "Safety first!", timestamp: "2 days ago" }],
    },
    {
        id: 105,
        author: "Hydrology Experts",
        timestamp: "6 days ago",
        location: "River Basins",
        category: "flood",
        title: "River Flooding Causes",
        description: "The primary cause of riverine floods is heavy rainfall over large areas for an extended period, or rapid melting of deep snow. These conditions increase the volume of water flowing into the river channel faster than it can be safely carried away. This often leads to the river exceeding its bankfull capacity and spilling into the surrounding floodplain.",
        image: flood5,
        likes: 12,
        comments: [],
    },
];

// =======================================================
// 2. الكومبوننت دلوقتي بيستقبل posts و setPosts من الأب
// =======================================================
export default function PostsContainer({ posts, setPosts }) {

    // State للتحكم في التفاعل الشكلي (مش محتاجين نرفعه للأب)
    const [likedIds, setLikedIds] = React.useState([]);
    const [savedIds, setSavedIds] = React.useState([]);
    const [expandedId, setExpandedId] = React.useState(null);

    // لو مفيش بوستات مبعوتة، ميعرضش حاجة (حماية)
    if (!posts) return null;

    return (
        <div className="posts-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {posts.map((data) => {
                const post = data;
                const isLiked = likedIds.includes(post.id);
                const isSaved = savedIds.includes(post.id);
                const commentsExpanded = expandedId === post.id;
                const badge = getCategoryBadge(post.category);

                const onLike = () => {
                    // تحديث الشكل
                    setLikedIds(prev => prev.includes(post.id) ? prev.filter(id => id !== post.id) : [...prev, post.id]);

                    // تحديث العدد الفعلي في البيانات (عشان يسمع في السايد بار)
                    setPosts(prevPosts => prevPosts.map(p => {
                        if (p.id === post.id) {
                            // لو معمول لايك شيله (نقص 1)، لو مش معمول زوده (زود 1)
                            const currentlyLiked = likedIds.includes(post.id);
                            return { ...p, likes: currentlyLiked ? Math.max(0, p.likes - 1) : p.likes + 1 };
                        }
                        return p;
                    }));
                };

                const onSave = () => setSavedIds(prev => prev.includes(post.id) ? prev.filter(id => id !== post.id) : [...prev, post.id]);
                const onToggleComments = () => setExpandedId(expandedId === post.id ? null : post.id);

                const onAddComment = (newCommentText) => {
                    if (!newCommentText) return;
                    const newCommentObj = {
                        id: `c${Date.now()}`,
                        author: "You",
                        content: newCommentText,
                        timestamp: "Just now"
                    };

                    setPosts(prevPosts => prevPosts.map(p => {
                        if (p.id === post.id) {
                            return { ...p, comments: [...p.comments, newCommentObj] };
                        }
                        return p;
                    }));
                };

                return (
                    <article className="post-card" key={post.id}>
                        <div className="post-header">
                            <div className="post-author-info">
                                <div className="author-avatar">{post.author?.charAt(0)}</div>
                                <div>
                                    <h3 className="author-name">{post.author}</h3>
                                    <div className="post-meta">
                                        <Clock size={14} />
                                        <span>{post.timestamp}</span>
                                        <MapPin size={14} />
                                        <span>{post.location}</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`category-badge ${badge.class}`}>{badge.text}</span>
                        </div>

                        {post.image && (
                            <div className="post-image-container">
                                <img src={post.image} alt={post.title} className="post-image" />
                            </div>
                        )}

                        <div className="post-content">
                            <h2 className="post-title">{post.title}</h2>
                            <p className="post-description">{post.description}</p>
                        </div>

                        <div className="post-actions">
                            <button className={`action-button ${isLiked ? "active-like" : ""}`} onClick={onLike}>
                                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                                {/* هنا بناخد القيمة من post.likes مباشرة لأننا حدثناها فوق */}
                                <span>{post.likes}</span>
                            </button>

                            <button className={`action-button ${commentsExpanded ? "active" : ""}`} onClick={onToggleComments}>
                                <MessageCircle size={20} />
                                <span>{post.comments?.length || 0}</span>
                            </button>

                            <button className={`action-button ${isSaved ? "active-save" : ""}`} onClick={onSave}>
                                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                            </button>

                            <button className="action-button">
                                <Share2 size={20} />
                            </button>
                        </div>

                        {commentsExpanded && (
                            <CommentsSection comments={post.comments} onAddComment={onAddComment} />
                        )}
                    </article>
                );
            })}
        </div>
    );
}