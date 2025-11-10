import { Report, User, Comment, Like, Bookmark } from "../models/index.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/uploadMiddleware.js";

const reportsController = {
  // إنشاء تقرير جديد مع رفع الصور إلى Cloudinary
  async createReport(req, res) {
    try {
      const {
        title,
        description,
        location_name,
        disaster_type,
        link,
        longitude,
        latitude,
      } = req.body;
      const created_by = req.user.id;

      // معالجة الملفات المرفوعة ورفعها إلى Cloudinary
      let images = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const imageUrl = await uploadToCloudinary(
              file.buffer,
              "disaster-reports"
            );
            images.push(imageUrl);
          } catch (uploadError) {
            console.error("خطأ في رفع الصورة إلى Cloudinary:", uploadError);

            // حذف جميع الصور التي تم رفعها في حالة الخطأ
            for (const uploadedImageUrl of images) {
              try {
                await deleteFromCloudinary(uploadedImageUrl);
              } catch (deleteError) {
                console.error("خطأ في حذف الصورة من Cloudinary:", deleteError);
              }
            }

            return res.status(500).json({
              success: false,
              message: "فشل في رفع الصور إلى السحابة",
            });
          }
        }
      }

      const reportData = {
        title,
        description,
        location_name,
        disaster_type,
        link: link || null,
        images,
        status: "active",
        created_by,
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
      };

      const report = await Report.create(reportData);

      res.status(201).json({
        success: true,
        message: "تم إنشاء التقرير بنجاح",
        data: {
          report: {
            ...report,
            images: images,
          },
        },
      });
    } catch (error) {
      console.error("خطأ في إنشاء التقرير:", error);

      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء إنشاء التقرير",
      });
    }
  },

  // تحديث تقرير مع رفع صور جديدة إلى Cloudinary
  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // التحقق من وجود التقرير
      const existingReport = await Report.findById(id);
      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      let newImages = [];

      // معالجة الملفات المرفوعة الجديدة
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const imageUrl = await uploadToCloudinary(
              file.buffer,
              "disaster-reports"
            );
            newImages.push(imageUrl);
          } catch (uploadError) {
            console.error("خطأ في رفع الصورة إلى Cloudinary:", uploadError);

            // حذف جميع الصور الجديدة التي تم رفعها في حالة الخطأ
            for (const uploadedImageUrl of newImages) {
              try {
                await deleteFromCloudinary(uploadedImageUrl);
              } catch (deleteError) {
                console.error("خطأ في حذف الصورة من Cloudinary:", deleteError);
              }
            }

            return res.status(500).json({
              success: false,
              message: "فشل في رفع الصور الجديدة إلى السحابة",
            });
          }
        }

        // دمج الصور الجديدة مع الصور القديمة
        const existingImages = existingReport.images || [];
        updateData.images = [...existingImages, ...newImages];
      }

      // معالجة الحقول الرقمية
      if (updateData.longitude)
        updateData.longitude = parseFloat(updateData.longitude);
      if (updateData.latitude)
        updateData.latitude = parseFloat(updateData.latitude);

      const updatedReport = await Report.update(id, updateData);

      res.json({
        success: true,
        message: "تم تحديث التقرير بنجاح",
        data: {
          report: updatedReport,
        },
      });
    } catch (error) {
      console.error("خطأ في تحديث التقرير:", error);

      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تحديث التقرير",
      });
    }
  },

  // حذف تقرير مع حذف الصور من Cloudinary
  async deleteReport(req, res) {
    try {
      const { id } = req.params;

      // التحقق من وجود التقرير
      const existingReport = await Report.findById(id);
      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      // حذف الصور المرتبطة بالتقرير من Cloudinary
      if (existingReport.images && existingReport.images.length > 0) {
        for (const imageUrl of existingReport.images) {
          try {
            await deleteFromCloudinary(imageUrl);
          } catch (deleteError) {
            console.error("خطأ في حذف صورة من Cloudinary:", deleteError);
          }
        }
      }

      await Report.delete(id);

      res.json({
        success: true,
        message: "تم حذف التقرير وصوره بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حذف التقرير:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء حذف التقرير",
      });
    }
  },

  // دالة جديدة: حذف صورة معينة من التقرير
  async deleteReportImage(req, res) {
    try {
      const { id, imageIndex } = req.params;

      // التحقق من وجود التقرير
      const existingReport = await Report.findById(id);
      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      // التحقق من وجود الصورة
      if (
        !existingReport.images ||
        !Array.isArray(existingReport.images) ||
        imageIndex < 0 ||
        imageIndex >= existingReport.images.length
      ) {
        return res.status(404).json({
          success: false,
          message: "الصورة غير موجودة في التقرير",
        });
      }

      // حذف الصورة من Cloudinary
      const imageUrlToDelete = existingReport.images[imageIndex];
      try {
        await deleteFromCloudinary(imageUrlToDelete);
      } catch (deleteError) {
        console.error("خطأ في حذف الصورة من Cloudinary:", deleteError);
      }

      // تحديث التقرير بحذف الصورة
      const updatedImages = [...existingReport.images];
      updatedImages.splice(parseInt(imageIndex), 1);

      await Report.update(id, { images: updatedImages });

      res.json({
        success: true,
        message: "تم حذف الصورة بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حذف الصورة:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء حذف الصورة",
      });
    }
  },

  // الحصول على جميع التقارير مع الفلترة
  async getReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        disaster_type,
        status,
        user_id,
      } = req.query;

      const filters = {};
      if (disaster_type) filters.disaster_type = disaster_type;
      if (status) filters.status = status;
      if (user_id) filters.user_id = user_id;

      const result = await Report.findAll(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("خطأ في جلب التقارير:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب التقارير",
      });
    }
  },

  // الحصول على تقرير محدد
  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const report = await Report.findById(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "التقرير غير موجود",
        });
      }

      // إضافة معلومات التفاعل إذا كان المستخدم مسجل دخول
      if (userId) {
        report.is_liked = await Like.isLiked(id, userId);
        report.is_bookmarked = await Bookmark.isBookmarked(id, userId);
      }

      res.json({
        success: true,
        data: { report },
      });
    } catch (error) {
      console.error("خطأ في جلب التقرير:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب التقرير",
      });
    }
  },

  // البحث عن تقارير قريبة جغرافياً
  async getNearbyReports(req, res) {
    try {
      const { lat, lng, radius = 10 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "الإحداثيات الجغرافية مطلوبة (lat, lng)",
        });
      }

      const reports = await Report.findByLocation(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius)
      );

      res.json({
        success: true,
        data: { reports },
      });
    } catch (error) {
      console.error("خطأ في البحث الجغرافي:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء البحث عن التقارير القريبة",
      });
    }
  },

  // الحصول على إحصائيات التقارير
  async getReportsStats(req, res) {
    try {
      const stats = await Report.getStats();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب إحصائيات التقارير",
      });
    }
  },

  // الحصول على تقارير المستخدم الحالي (إذا كان أدمن)
  async getMyReports(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const result = await Report.findAll(
        { user_id: userId },
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("خطأ في جلب تقارير المستخدم:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب تقاريرك",
      });
    }
  },
};

export default reportsController;
