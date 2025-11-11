import db from "../config/database.js";

const Comment = {
  async create(commentData) {
    try {
      const [comment] = await db("comments").insert(commentData).returning("*");
      return comment;
    } catch (error) {
      throw new Error(`فشل في إنشاء التعليق: ${error.message}`);
    }
  },

  async findByReportId(reportId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const comments = await db("comments")
        .where({ report_id: reportId })
        .leftJoin("users", "comments.user_id", "users.id")
        .select(
          "comments.*",
          "users.name as user_name",
          "users.email as user_email"
        )
        .orderBy("comments.created_at", "desc")
        .limit(limit)
        .offset(offset);

      const total = await db("comments")
        .where({ report_id: reportId })
        .count("* as count")
        .first();

      return {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / limit),
        },
      };
    } catch (error) {
      throw new Error(`فشل في جلب التعليقات: ${error.message}`);
    }
  },

  async findById(id) {
    try {
      const comment = await db("comments")
        .where({ "comments.id": id })
        .leftJoin("users", "comments.user_id", "users.id")
        .select(
          "comments.*",
          "users.name as user_name",
          "users.email as user_email"
        )
        .first();
      return comment;
    } catch (error) {
      throw new Error(`فشل في البحث عن التعليق: ${error.message}`);
    }
  },

  async update(id, updateData) {
    try {
      const [comment] = await db("comments")
        .where({ id })
        .update(updateData)
        .returning("*");
      return comment;
    } catch (error) {
      throw new Error(`فشل في تحديث التعليق: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      await db("comments").where({ id }).delete();
      return true;
    } catch (error) {
      throw new Error(`فشل في حذف التعليق: ${error.message}`);
    }
  },

  async getUserComments(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const comments = await db("comments")
        .where({ "comments.user_id": userId })
        .leftJoin("reports", "comments.report_id", "reports.id")
        .select(
          "comments.*",
          "reports.title as report_title",
          "reports.disaster_type"
        )
        .orderBy("comments.created_at", "desc")
        .limit(limit)
        .offset(offset);

      const total = await db("comments")
        .where({ user_id: userId })
        .count("* as count")
        .first();

      return {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / limit),
        },
      };
    } catch (error) {
      throw new Error(`فشل في جلب تعليقات المستخدم: ${error.message}`);
    }
  },
};

export default Comment;
