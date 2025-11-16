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
      console.log('getMyLikes called', { user: req.user?.id, query: req.query });
      const { page = 1, limit = 10 } = req.query;
      const user_id = req.user.id;

      console.log('Like.getUserLikes exists?', !!Like.getUserLikes, typeof Like.getUserLikes);
      const result = await Like.getUserLikes(
        user_id,
        parseInt(page),
        parseInt(limit)
      );

      console.log('getUserLikes result:', result && (Array.isArray(result) ? result.length : result));
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

  // جلب كل تقارير المستخدم (نستخدم واجهة Report.findAll إن كانت متاحة)
  async getReportsForUser(req, res) {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 1000 } = req.query;

      // التحقق من وجود المستخدم
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }

      const reportsResult = await Report.findAll({ user_id }, 1, 1000);
      const reports = reportsResult?.reports || reportsResult || [];

      const likesAggregated = [];

      for (const rpt of reports) {
        const reportId = rpt.id ?? rpt.report_id ?? rpt._id;
        if (!reportId) continue;
        const likes = (await Like.getReportLikes(reportId)) || [];
        likes.forEach((likeItem) => {
          likesAggregated.push({
            report_id: reportId,
            report_title: rpt.title || rpt.location_name || null,
            like: likeItem,
          });
        });
      }

      const startIndex = (page - 1) * limit;
      const paginated = likesAggregated.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        data: {
          likes: paginated,
          pagination: {
            page,
            limit,
            total: likesAggregated.length,
            totalPages: Math.ceil(likesAggregated.length / limit),
          },
        },
      });
    } catch (error) {
      console.error("خطأ في جلب الإعجابات على تقارير المستخدم:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب الإعجابات على تقاريرك",
      });
    }
  },
};

export default likesController;
