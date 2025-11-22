import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";

export default function useMostLikedPosts() {
  const [mostLikedPosts, setMostLikedPosts] = useState([]);
  const [mostLikedLoading, setMostLikedLoading] = useState(true);

  useEffect(() => {
    async function fetchMostLiked() {
      setMostLikedLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/reports/top/liked?limit=5`
        );
        if (res.data?.success && Array.isArray(res.data.data.reports)) {
          setMostLikedPosts(
            res.data.data.reports.map((item) => ({
              id: String(item.id),
              title: item.title,
              description: item.description,
              location: item.location_name,
              category: item.disaster_type,
              author: item.author_name,
              authorId: String(
                item.author_id ??
                  item.authorId ??
                  item.user_id ??
                  item.userId ??
                  ""
              ),
              timestamp: new Date(item.created_at).toLocaleString(),
              likes: Number(item.likes_count) || 0,
              comments: [],
              image: item.images?.length ? item.images[0] : null,
            }))
          );
        } else {
          setMostLikedPosts([]);
        }
      } catch (err) {
        setMostLikedPosts([]);
        console.log("Error fetching most liked posts:", err);
      } finally {
        setMostLikedLoading(false);
      }
    }
    fetchMostLiked();
  }, []);

  return { mostLikedPosts, mostLikedLoading };
}
