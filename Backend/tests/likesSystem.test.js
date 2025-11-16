import fetch from "node-fetch";
import { User, Report, Like } from "../src/models/index.js";

const testLikesSystem = async () => {
  try {
    console.log("🧪 بدء اختبار نظام الإعجابات الشامل...\n");

    const timestamp = Date.now();
    let userToken, userId, reportId;

    // 1. تسجيل مستخدم عادي
    console.log("1. 👤 تسجيل مستخدم عادي...");
    const userEmail = `user_likes_${timestamp}@example.com`;

    const userRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "مستخدم الإعجابات",
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

    // 2. إنشاء تقرير للاختبار
    console.log("2. 📝 إنشاء تقرير للاختبار...");

    // نحتاج أدمن لإنشاء تقرير
    const adminEmail = `admin_likes_${timestamp}@example.com`;
    const adminRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "أدمن الإعجابات",
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
          title: "تقرير اختبار الإعجابات",
          description: "هذا تقرير لاختبار نظام الإعجابات",
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
      } else {
        console.log("   ❌ فشل إنشاء التقرير:", createReportResult.message);
        return;
      }
    } else {
      console.log("   ❌ فشل تسجيل الأدمن:", adminResult.message);
      return;
    }

    // 3. اختبار إضافة إعجاب
    console.log("3. ❤️ اختبار إضافة إعجاب...");
    const addLike = await fetch("http://localhost:5000/api/likes/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        report_id: reportId,
      }),
    });

    const addLikeResult = await addLike.json();
    console.log("   ✅ إضافة الإعجاب:", addLikeResult.success);
    console.log(
      "   💖 الحالة:",
      addLikeResult.data.liked ? "معجب" : "غير معجب"
    );

    // 4. اختبار التحقق من حالة الإعجاب
    console.log("4. ✅ اختبار التحقق من حالة الإعجاب...");
    const checkLike = await fetch(
      `http://localhost:5000/api/likes/check/${reportId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const checkLikeResult = await checkLike.json();
    console.log("   ✅ التحقق من الحالة:", checkLikeResult.success);
    console.log("   📊 عدد الإعجابات:", checkLikeResult.data.likes_count);

    // 5. اختبار جلب الإعجابات للمستخدم
    console.log("5. 📋 اختبار جلب الإعجابات...");
    const getMyLikes = await fetch("http://localhost:5000/api/likes/my", {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const getMyLikesResult = await getMyLikes.json();
    console.log("   ✅ جلب الإعجابات:", getMyLikesResult.success);
    console.log("   📁 عدد الإعجابات:", getMyLikesResult.data.likes.length);

    // 6. اختبار قائمة المعجبين
    console.log("6. 👥 اختبار قائمة المعجبين...");
    const getLikesList = await fetch(
      `http://localhost:5000/api/likes/list/${reportId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const getLikesListResult = await getLikesList.json();
    console.log("   ✅ قائمة المعجبين:", getLikesListResult.success);
    console.log("   👤 عدد المعجبين:", getLikesListResult.data.likes.length);

    // 7. اختبار إزالة الإعجاب
    console.log("7. 🗑️ اختبار إزالة الإعجاب...");
    const removeLike = await fetch("http://localhost:5000/api/likes/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        report_id: reportId,
      }),
    });

    const removeLikeResult = await removeLike.json();
    console.log("   ✅ إزالة الإعجاب:", removeLikeResult.success);
    console.log(
      "   💖 الحالة:",
      removeLikeResult.data.liked ? "معجب" : "غير معجب"
    );

    // 8. اختبار عدد الإعجابات بعد الإزالة
    console.log("8. 📊 اختبار عدد الإعجابات بعد الإزالة...");
    const finalCount = await fetch(
      `http://localhost:5000/api/likes/count/${reportId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const finalCountResult = await finalCount.json();
    console.log("   ✅ العدد النهائي:", finalCountResult.data.likes_count);

    // 9. تنظيف
    console.log("9. 🧹 تنظيف البيانات...");
    await Report.delete(reportId);
    await User.delete(userId);
    console.log("   ✅ تم التنظيف");

    console.log("\n🎉 اختبار نظام الإعجابات اكتمل بنجاح!");
  } catch (error) {
    console.error("❌ فشل اختبار النظام:", error.message);
  }
};

// تشغيل الاختبار
testLikesSystem();
