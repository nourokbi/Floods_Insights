import db from "../config/database.js";

const Like = {
  async toggleLike(reportId, userId) {
    try {
      // التحقق من وجود إعجاب سابق
      const existingLike = await db("likes")
        .where({ report_id: reportId, user_id: userId })
        .first();

      if (existingLike) {
        // إذا موجود، نقوم بإزالته (Unlike)
        await db("likes")
          .where({ report_id: reportId, user_id: userId })
          .delete();
        return { liked: false, action: "removed" };
      } else {
        // إذا غير موجود، نضيف إعجاب جديد
        await db("likes").insert({
          report_id: reportId,
          user_id: userId,
        });
        return { liked: true, action: "added" };
      }
    } catch (error) {
      throw new Error(`فشل في تبديل حالة الإعجاب: ${error.message}`);
    }
  },

  async getLikesCount(reportId) {
    try {
      const result = await db("likes")
        .where({ report_id: reportId })
        .count("* as count")
        .first();
      return parseInt(result.count);
    } catch (error) {
      throw new Error(`فشل في جلب عدد الإعجابات: ${error.message}`);
    }
  },

  async isLiked(reportId, userId) {
    try {
      const like = await db("likes")
        .where({ report_id: reportId, user_id: userId })
        .first();
      return !!like;
    } catch (error) {
      throw new Error(`فشل في التحقق من حالة الإعجاب: ${error.message}`);
    }
  },

  async getUserLikes(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const likes = await db("likes")
        .where({ "likes.user_id": userId })
        .leftJoin("reports", "likes.report_id", "reports.id")
        .leftJoin("users", "reports.created_by", "users.id")
        .select(
          "likes.*",
          "reports.title as report_title",
          "reports.disaster_type",
          "reports.status",
          "users.name as author_name"
        )
        .orderBy("likes.created_at", "desc")
        .limit(limit)
        .offset(offset);

      const total = await db("likes")
        .where({ user_id: userId })
        .count("* as count")
        .first();

      return {
        likes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / limit),
        },
      };
    } catch (error) {
      throw new Error(`فشل في جلب إعجابات المستخدم: ${error.message}`);
    }
  },

  async getReportLikes(reportId) {
    try {
      const likes = await db("likes")
        .where({ report_id: reportId })
        .leftJoin("users", "likes.user_id", "users.id")
        .select(
          "likes.*",
          "users.name as user_name",
          "users.email as user_email"
        )
        .orderBy("likes.created_at", "desc");

      return likes;
    } catch (error) {
      throw new Error(`فشل في جلب إعجابات التقرير: ${error.message}`);
    }
  },
};

export default Like;
