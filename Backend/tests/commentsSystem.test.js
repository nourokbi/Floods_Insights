import fetch from "node-fetch";
import { User, Report, Comment } from "../src/models/index.js";

const testCommentsSystem = async () => {
  try {
    console.log("🧪 بدء اختبار نظام التعليقات الشامل...\n");

    const timestamp = Date.now();
    let adminToken, userToken, adminId, userId, reportId;

    // 1. تسجيل أدمن
    console.log("1. 🔐 تسجيل أدمن...");
    const adminEmail = `admin_comments_${timestamp}@example.com`;

    const adminRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "أدمن التعليقات",
          email: adminEmail,
          password: "password123",
          role: "admin",
        }),
      }
    );

    const adminResult = await adminRegister.json();
    if (adminResult.success) {
      adminToken = adminResult.data.token;
      adminId = adminResult.data.user.id;
      console.log("   ✅ تم تسجيل الأدمن:", adminId);
    } else {
      console.log("   ❌ فشل تسجيل الأدمن:", adminResult.message);
      return;
    }

    // 2. تسجيل مستخدم عادي
    console.log("2. 👤 تسجيل مستخدم عادي...");
    const userEmail = `user_comments_${timestamp}@example.com`;

    const userRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "مستخدم التعليقات",
          email: userEmail,
          password: "password123",
        }),
      }
    );

    const userResult = await userRegister.json();
    if (userResult.success) {
      userToken = userResult.data.token;
      userId = userResult.data.user.id;
      console.log("   ✅ تم تسجيل المستخدم العادي:", userId);
    } else {
      console.log("   ❌ فشل تسجيل المستخدم:", userResult.message);
      return;
    }

    // 3. إنشاء تقرير (بالأدمن)
    console.log("3. 📝 إنشاء تقرير للتعليق...");
    const createReport = await fetch("http://localhost:5000/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "تقرير اختبار التعليقات",
        description: "هذا تقرير لاختبار نظام التعليقات",
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
    } else {
      console.log("   ❌ فشل إنشاء التقرير:", createReportResult.message);
      return;
    }

    // 4. اختبار إضافة تعليق (بالمستخدم العادي)
    console.log("4. 💬 اختبار إضافة تعليق...");
    const addComment = await fetch("http://localhost:5000/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        report_id: reportId,
        comment_text: "هذا تعليق اختباري على التقرير",
      }),
    });

    const addCommentResult = await addComment.json();
    if (addCommentResult.success) {
      const commentId = addCommentResult.data.comment.id;
      console.log("   ✅ تم إضافة التعليق:", commentId);

      // 5. اختبار جلب تعليقات التقرير
      console.log("5. 🔍 اختبار جلب تعليقات التقرير...");
      const getComments = await fetch(
        `http://localhost:5000/api/comments/report/${reportId}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const getCommentsResult = await getComments.json();
      console.log(
        "   ✅ جلب التعليقات:",
        getCommentsResult.success,
        `(${getCommentsResult.data.comments.length} تعليق)`
      );

      // 6. اختبار تحديث التعليق
      console.log("6. ✏️ اختبار تحديث التعليق...");
      const updateComment = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            comment_text: "هذا تعليق محدث ومعدل",
          }),
        }
      );

      const updateCommentResult = await updateComment.json();
      console.log("   ✅ تحديث التعليق:", updateCommentResult.success);

      // 7. اختبار جلب تعليقات المستخدم
      console.log("7. 👤 اختبار جلب تعليقات المستخدم...");
      const getMyComments = await fetch(
        "http://localhost:5000/api/comments/my/comments",
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const getMyCommentsResult = await getMyComments.json();
      console.log(
        "   ✅ تعليقات المستخدم:",
        getMyCommentsResult.success,
        `(${getMyCommentsResult.data.comments.length} تعليق)`
      );

      // 8. اختبار حذف التعليق
      console.log("8. 🗑️ اختبار حذف التعليق...");
      const deleteComment = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const deleteCommentResult = await deleteComment.json();
      console.log("   ✅ حذف التعليق:", deleteCommentResult.success);
    } else {
      console.log("   ❌ فشل إضافة التعليق:", addCommentResult.message);
    }

    // 9. تنظيف
    console.log("9. 🧹 تنظيف البيانات...");
    await Report.delete(reportId);
    await User.delete(adminId);
    await User.delete(userId);
    console.log("   ✅ تم التنظيف");

    console.log("\n🎉 اختبار نظام التعليقات اكتمل بنجاح!");
  } catch (error) {
    console.error("❌ فشل اختبار النظام:", error.message);
  }
};

// تشغيل الاختبار
testCommentsSystem();
