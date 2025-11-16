import fetch from "node-fetch";
import { User, Report, Bookmark } from "../src/models/index.js";

const testBookmarksSystem = async () => {
  try {
    console.log("🧪 بدء اختبار نظام الإشارات المرجعية الشامل...\n");

    const timestamp = Date.now();
    let userToken, userId, reportId;

    // 1. تسجيل مستخدم عادي
    console.log("1. 👤 تسجيل مستخدم عادي...");
    const userEmail = `user_bookmarks_${timestamp}@example.com`;

    const userRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "مستخدم الإشارات",
          email: userEmail,
          password: "password123",
        }),
      }
    );

    const userResult = await userRegister.json();
    if (userResult.success) {
      userToken = userResult.data.token;
      userId = userResult.data.user.id;
      console.log("   ✅ تم تسجيل المستخدم:", userId);
    } else {
      console.log("   ❌ فشل تسجيل المستخدم:", userResult.message);
      return;
    }

    // 2. إنشاء تقرير (سنستخدم تقرير موجود أو ننشئ واحد)
    console.log("2. 📝 التحضير: البحث عن تقرير للاختبار...");

    // جلب تقارير موجودة
    const getReports = await fetch(
      "http://localhost:5000/api/reports?limit=1",
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const reportsResult = await getReports.json();

    if (reportsResult.success && reportsResult.data.reports.length > 0) {
      reportId = reportsResult.data.reports[0].id;
      console.log("   ✅ استخدام تقرير موجود:", reportId);
    } else {
      // إذا لم توجد تقارير، ننشئ واحد
      console.log("   📝 إنشاء تقرير جديد...");

      // نحتاج أدمن لإنشاء تقرير
      const adminEmail = `admin_temp_${timestamp}@example.com`;
      const adminRegister = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "أدمن مؤقت",
            email: adminEmail,
            password: "password123",
            role: "admin",
          }),
        }
      );

      const adminResult = await adminRegister.json();
      if (adminResult.success) {
        const adminToken = adminResult.data.token;
        const adminId = adminResult.data.user.id;

        const createReport = await fetch("http://localhost:5000/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            title: "تقرير اختبار الإشارات المرجعية",
            description: "هذا تقرير لاختبار نظام الإشارات المرجعية",
            location_name: "موقع الاختبار",
            disaster_type: "flood",
            longitude: 46.6753,
            latitude: 24.7136,
          }),
        });

        const createReportResult = await createReport.json();
        if (createReportResult.success) {
          reportId = createReportResult.data.report.id;
          console.log("   ✅ تم إنشاء التقرير:", reportId);

          // تنظيف الأدمن المؤقت
          await User.delete(adminId);
        }
      }
    }

    if (!reportId) {
      console.log("   ❌ فشل في الحصول على تقرير للاختبار");
      return;
    }

    // 3. اختبار إضافة إشارة مرجعية
    console.log("3. 🔖 اختبار إضافة إشارة مرجعية...");
    const addBookmark = await fetch(
      "http://localhost:5000/api/bookmarks/toggle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          report_id: reportId,
        }),
      }
    );

    const addBookmarkResult = await addBookmark.json();
    console.log("   ✅ إضافة الإشارة:", addBookmarkResult.success);
    console.log(
      "   📌 الحالة:",
      addBookmarkResult.data.bookmarked ? "مضاف" : "غير مضاف"
    );

    // 4. اختبار التحقق من حالة الإشارة
    console.log("4. ✅ اختبار التحقق من حالة الإشارة...");
    const checkBookmark = await fetch(
      `http://localhost:5000/api/bookmarks/check/${reportId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const checkBookmarkResult = await checkBookmark.json();
    console.log("   ✅ التحقق من الحالة:", checkBookmarkResult.success);
    console.log(
      "   📊 عدد الإشارات:",
      checkBookmarkResult.data.bookmarks_count
    );

    // 5. اختبار جلب الإشارات المرجعية للمستخدم
    console.log("5. 📋 اختبار جلب الإشارات المرجعية...");
    const getMyBookmarks = await fetch(
      "http://localhost:5000/api/bookmarks/my",
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const getMyBookmarksResult = await getMyBookmarks.json();
    console.log("   ✅ جلب الإشارات:", getMyBookmarksResult.success);
    console.log(
      "   📁 عدد الإشارات:",
      getMyBookmarksResult.data.bookmarks.length
    );

    // 6. اختبار إزالة الإشارة المرجعية
    console.log("6. 🗑️ اختبار إزالة الإشارة المرجعية...");
    const removeBookmark = await fetch(
      "http://localhost:5000/api/bookmarks/toggle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          report_id: reportId,
        }),
      }
    );

    const removeBookmarkResult = await removeBookmark.json();
    console.log("   ✅ إزالة الإشارة:", removeBookmarkResult.success);
    console.log(
      "   📌 الحالة:",
      removeBookmarkResult.data.bookmarked ? "مضاف" : "غير مضاف"
    );

    // 7. اختبار عدد الإشارات بعد الإزالة
    console.log("7. 📊 اختبار عدد الإشارات بعد الإزالة...");
    const finalCount = await fetch(
      `http://localhost:5000/api/bookmarks/count/${reportId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const finalCountResult = await finalCount.json();
    console.log("   ✅ العدد النهائي:", finalCountResult.data.bookmarks_count);

    // 8. تنظيف
    console.log("8. 🧹 تنظيف البيانات...");
    await User.delete(userId);
    console.log("   ✅ تم التنظيف");

    console.log("\n🎉 اختبار نظام الإشارات المرجعية اكتمل بنجاح!");
  } catch (error) {
    console.error("❌ فشل اختبار النظام:", error.message);
  }
};

// تشغيل الاختبار
testBookmarksSystem();
