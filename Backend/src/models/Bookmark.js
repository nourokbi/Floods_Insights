import db from "../config/database.js";

const Bookmark = {
  async toggleBookmark(reportId, userId) {
    try {
      const existingBookmark = await db("bookmarks")
        .where({ report_id: reportId, user_id: userId })
        .first();

      if (existingBookmark) {
        await db("bookmarks")
          .where({ report_id: reportId, user_id: userId })
          .delete();
        return { bookmarked: false, action: "removed" };
      } else {
        await db("bookmarks").insert({
          report_id: reportId,
          user_id: userId,
        });
        return { bookmarked: true, action: "added" };
      }
    } catch (error) {
      throw new Error(`فشل في تبديل حالة الإشارة المرجعية: ${error.message}`);
    }
  },

  async getUserBookmarks(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const bookmarks = await db("bookmarks")
        .where({ "bookmarks.user_id": userId })
        .leftJoin("reports", "bookmarks.report_id", "reports.id")
        .leftJoin("users", "reports.created_by", "users.id")
        .select(
          "bookmarks.*",
          "reports.title",
          "reports.description",
          "reports.disaster_type",
          "reports.status",
          "reports.location_name",
          "reports.created_at as report_created_at",
          "users.name as author_name",
          db.raw("ST_X(reports.location_coordinates) as longitude"),
          db.raw("ST_Y(reports.location_coordinates) as latitude"),
          db.raw(
            "(SELECT COUNT(*) FROM comments WHERE report_id = reports.id) as comments_count"
          ),
          db.raw(
            "(SELECT COUNT(*) FROM likes WHERE report_id = reports.id) as likes_count"
          )
        )
        .orderBy("bookmarks.created_at", "desc")
        .limit(limit)
        .offset(offset);

      const total = await db("bookmarks")
        .where({ user_id: userId })
        .count("* as count")
        .first();

      return {
        bookmarks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / limit),
        },
      };
    } catch (error) {
      throw new Error(`فشل في جلب الإشارات المرجعية: ${error.message}`);
    }
  },

  async isBookmarked(reportId, userId) {
    try {
      const bookmark = await db("bookmarks")
        .where({ report_id: reportId, user_id: userId })
        .first();
      return !!bookmark;
    } catch (error) {
      throw new Error(
        `فشل في التحقق من حالة الإشارة المرجعية: ${error.message}`
      );
    }
  },

  async getBookmarksCount(reportId) {
    try {
      const result = await db("bookmarks")
        .where({ report_id: reportId })
        .count("* as count")
        .first();
      return parseInt(result.count);
    } catch (error) {
      throw new Error(`فشل في جلب عدد الإشارات المرجعية: ${error.message}`);
    }
  },
};

export default Bookmark;
