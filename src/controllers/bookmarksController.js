import { Bookmark, User, Report } from "../models/index.js";

const bookmarksController = {
  // تبديل حالة الإشارة المرجعية (إضافة/إزالة)
  async toggleBookmark(req, res) {
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

      const result = await Bookmark.toggleBookmark(report_id, user_id);

      res.json({
        success: true,
        message: result.bookmarked
          ? "تم إضافة التقرير إلى الإشارات المرجعية"
          : "تم إزالة التقرير من الإشارات المرجعية",
        data: result,
      });
    } catch (error) {
      console.error("خطأ في تبديل الإشارة المرجعية:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تعديل الإشارة المرجعية",
      });
    }
  },

  // الحصول على الإشارات المرجعية للمستخدم الحالي
  async getMyBookmarks(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const user_id = req.user.id;

      const result = await Bookmark.getUserBookmarks(
        user_id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("خطأ في جلب الإشارات المرجعية:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب الإشارات المرجعية",
      });
    }
  },

  // التحقق من إذا كان التقرير مضاف إلى الإشارات المرجعية
  async checkBookmarkStatus(req, res) {
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

      const isBookmarked = await Bookmark.isBookmarked(report_id, user_id);
      const bookmarksCount = await Bookmark.getBookmarksCount(report_id);

      res.json({
        success: true,
        data: {
          is_bookmarked: isBookmarked,
          bookmarks_count: bookmarksCount,
        },
      });
    } catch (error) {
      console.error("خطأ في التحقق من حالة الإشارة المرجعية:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء التحقق من حالة الإشارة المرجعية",
      });
    }
  },

  // الحصول على عدد الإشارات المرجعية لتقرير محدد
  async getBookmarksCount(req, res) {
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

      const bookmarksCount = await Bookmark.getBookmarksCount(report_id);

      res.json({
        success: true,
        data: {
          report_id: parseInt(report_id),
          bookmarks_count: bookmarksCount,
        },
      });
    } catch (error) {
      console.error("خطأ في جلب عدد الإشارات المرجعية:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب عدد الإشارات المرجعية",
      });
    }
  },
};

export default bookmarksController;
