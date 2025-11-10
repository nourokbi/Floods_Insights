import { Like, User, Report } from "../models/index.js";

const likesController = {
  // تبديل حالة الإعجاب (إضافة/إزالة)
  async toggleLike(req, res) {
    try {
      const { report_id } = req.body;
      const user_id = req.user.id;

      // التحقق من وجود التقرير
      const report = await Report.findById(report_id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      const result = await Like.toggleLike(report_id, user_id);

      res.json({
        success: true,
        message: result.liked ? "تم إضافة الإعجاب" : "تم إزالة الإعجاب",
        data: result,
      });
    } catch (error) {
      console.error("خطأ في تبديل الإعجاب:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تعديل الإعجاب",
      });
    }
  },

  // الحصول على الإعجابات للمستخدم الحالي
  async getMyLikes(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const user_id = req.user.id;

      const result = await Like.getUserLikes(
        user_id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("خطأ في جلب الإعجابات:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب الإعجابات",
      });
    }
  },

  // التحقق من إذا كان التقرير معجب به
  async checkLikeStatus(req, res) {
    try {
      const { report_id } = req.params;
      const user_id = req.user.id;

      // التحقق من وجود التقرير
      const report = await Report.findById(report_id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      const isLiked = await Like.isLiked(report_id, user_id);
      const likesCount = await Like.getLikesCount(report_id);

      res.json({
        success: true,
        data: {
          is_liked: isLiked,
          likes_count: likesCount,
        },
      });
    } catch (error) {
      console.error("خطأ في التحقق من حالة الإعجاب:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء التحقق من حالة الإعجاب",
      });
    }
  },

  // الحصول على عدد الإعجابات لتقرير محدد
  async getLikesCount(req, res) {
    try {
      const { report_id } = req.params;

      // التحقق من وجود التقرير
      const report = await Report.findById(report_id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      const likesCount = await Like.getLikesCount(report_id);

      res.json({
        success: true,
        data: {
          report_id: parseInt(report_id),
          likes_count: likesCount,
        },
      });
    } catch (error) {
      console.error("خطأ في جلب عدد الإعجابات:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب عدد الإعجابات",
      });
    }
  },

  // الحصول على قائمة المعجبين بتقرير محدد
  async getLikesList(req, res) {
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

      const likes = await Like.getReportLikes(report_id);

      // تطبيق pagination يدوياً إذا كان ضرورياً
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedLikes = likes.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          likes: paginatedLikes,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: likes.length,
            totalPages: Math.ceil(likes.length / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("خطأ في جلب قائمة المعجبين:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب قائمة المعجبين",
      });
    }
  },
};

export default likesController;
