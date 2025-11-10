import { User, Report, Comment, Like, Bookmark } from "../src/models/index.js";

const testAllModels = async () => {
  try {
    console.log("🚀 بدء الاختبار الشامل لجميع النماذج...\n");

    // استخدام طابع زمني لضمان عدم التكرار
    const timestamp = Date.now();
    const uniqueEmail = `test_${timestamp}@example.com`;

    // 1. اختبار نموذج المستخدم
    console.log("1. 🔐 اختبار نموذج المستخدم...");
    const testUser = {
      name: `مختبر النماذج ${timestamp}`,
      email: uniqueEmail,
      password: "password123",
      role: "user",
    };
    const user = await User.create(testUser);
    console.log("   ✅ تم إنشاء المستخدم:", user.id);

    // 2. اختبار نموذج التقرير
    console.log("2. 📊 اختبار نموذج التقرير...");
    const testReport = {
      title: `تقرير اختبار شامل ${timestamp}`,
      description: "هذا تقرير لاختبار جميع النماذج",
      location_name: "موقع الاختبار",
      disaster_type: "flood",
      status: "active",
      created_by: user.id,
      longitude: 46.6753 + Math.random() * 0.01, // إضافة اختلاف بسيط في الإحداثيات
      latitude: 24.7136 + Math.random() * 0.01,
    };
    const report = await Report.create(testReport);
    console.log("   ✅ تم إنشاء التقرير:", report.id);

    // 3. اختبار نموذج التعليق
    console.log("3. 💬 اختبار نموذج التعليق...");
    const testComment = {
      report_id: report.id,
      user_id: user.id,
      comment_text: "هذا تعليق اختباري",
    };
    const comment = await Comment.create(testComment);
    console.log("   ✅ تم إنشاء التعليق:", comment.id);

    // 4. اختبار نموذج الإعجاب
    console.log("4. ❤️ اختبار نموذج الإعجاب...");
    const likeResult = await Like.toggleLike(report.id, user.id);
    console.log("   ✅ تبديل الإعجاب:", likeResult.action);

    const likeCount = await Like.getLikesCount(report.id);
    console.log("   ✅ عدد الإعجابات:", likeCount);

    // 5. اختبار نموذج الإشارة المرجعية
    console.log("5. 🔖 اختبار نموذج الإشارة المرجعية...");
    const bookmarkResult = await Bookmark.toggleBookmark(report.id, user.id);
    console.log("   ✅ تبديل الإشارة المرجعية:", bookmarkResult.action);

    const bookmarks = await Bookmark.getUserBookmarks(user.id);
    console.log("   ✅ عدد الإشارات المرجعية:", bookmarks.bookmarks.length);

    // 6. اختبار الاستعلامات
    console.log("6. 🔍 اختبار الاستعلامات...");

    const foundReport = await Report.findById(report.id);
    console.log("   ✅ البحث عن التقرير:", foundReport.title);

    const reportComments = await Comment.findByReportId(report.id);
    console.log("   ✅ تعليقات التقرير:", reportComments.comments.length);

    const userLikes = await Like.getUserLikes(user.id);
    console.log("   ✅ إعجابات المستخدم:", userLikes.likes.length);

    // 7. اختبار الإحصائيات
    console.log("7. 📈 اختبار الإحصائيات...");
    const stats = await Report.getStats();
    console.log("   ✅ إحصائيات التقارير:", stats.totals);

    console.log("\n🎉 جميع اختبارات النماذج اكتملت بنجاح!");
    console.log("📋 الملخص:");
    console.log("   - المستخدمين: ✅");
    console.log("   - التقارير: ✅");
    console.log("   - التعليقات: ✅");
    console.log("   - الإعجابات: ✅");
    console.log("   - الإشارات المرجعية: ✅");

    // تنظيف البيانات الاختبارية (اختياري)
    console.log("\n🧹 تنظيف البيانات الاختبارية...");
    await Comment.delete(comment.id);
    await Report.delete(report.id);
    await User.delete(user.id);
    console.log("   ✅ تم تنظيف البيانات الاختبارية");
  } catch (error) {
    console.error("❌ فشل الاختبار الشامل:", error.message);
    console.error("🔧 تفاصيل الخطأ:", error);
  }
};

// تشغيل الاختبار الشامل
testAllModels();
