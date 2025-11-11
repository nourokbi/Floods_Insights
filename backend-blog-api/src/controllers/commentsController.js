import { Comment, User, Report } from "../models/index.js";

const commentsController = {
  // إضافة تعليق جديد
  async addComment(req, res) {
    try {
      const { report_id, comment_text } = req.body;
      const user_id = req.user.id;

      // التحقق من وجود التقرير
      const report = await Report.findById(report_id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      const commentData = {
        report_id,
        user_id,
        comment_text,
      };

      const comment = await Comment.create(commentData);

      res.status(201).json({
        success: true,
        message: "تم إضافة التعليق بنجاح",
        data: { comment },
      });
    } catch (error) {
      console.error("خطأ في إضافة التعليق:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء إضافة التعليق",
      });
    }
  },

  // الحصول على تعليقات تقرير محدد
  async getCommentsByReport(req, res) {
    try {
      const { report_id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // التحقق من وجود التقرير
      const report = await Report.findById(report_id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      const result = await Comment.findByReportId(
        report_id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("خطأ في جلب التعليقات:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب التعليقات",
      });
    }
  },

  // تحديث تعليق
  async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { comment_text } = req.body;
      const user_id = req.user.id;

      // التحقق من وجود التعليق
      const existingComment = await Comment.findById(id);
      if (!existingComment) {
        return res.status(404).json({
          success: false,
          message: "التعليق غير موجود",
        });
      }

      // التحقق من أن المستخدم هو صاحب التعليق
      if (existingComment.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: "غير مسموح بتعديل هذا التعليق",
        });
      }

      const updatedComment = await Comment.update(id, { comment_text });

      res.json({
        success: true,
        message: "تم تحديث التعليق بنجاح",
        data: { comment: updatedComment },
      });
    } catch (error) {
      console.error("خطأ في تحديث التعليق:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تحديث التعليق",
      });
    }
  },

  // حذف تعليق
  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // التحقق من وجود التعليق
      const existingComment = await Comment.findById(id);
      if (!existingComment) {
        return res.status(404).json({
          success: false,
          message: "التعليق غير موجود",
        });
      }

      // التحقق من أن المستخدم هو صاحب التعليق أو أدمن
      const user = await User.findById(user_id);
      if (existingComment.user_id !== user_id && user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "غير مسموح بحذف هذا التعليق",
        });
      }

      await Comment.delete(id);

      res.json({
        success: true,
        message: "تم حذف التعليق بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حذف التعليق:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء حذف التعليق",
      });
    }
  },

  // الحصول على تعليقات المستخدم الحالي
  async getMyComments(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const user_id = req.user.id;

      const result = await Comment.getUserComments(
        user_id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("خطأ في جلب تعليقات المستخدم:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب تعليقاتك",
      });
    }
  },
};

export default commentsController;
