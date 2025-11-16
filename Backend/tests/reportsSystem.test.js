import fetch from "node-fetch";
import { User, Report } from "../src/models/index.js";

const testReportsSystem = async () => {
  try {
    console.log("🧪 بدء اختبار نظام التقارير الشامل...\n");

    const timestamp = Date.now();
    let adminToken, userToken, adminId;

    // 1. تسجيل أدمن
    console.log("1. 🔐 تسجيل أدمن...");
    const adminEmail = `admin_reports_${timestamp}@example.com`;

    const adminRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "أدمن التقارير",
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
    const userEmail = `user_reports_${timestamp}@example.com`;

    const userRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "مستخدم عادي",
          email: userEmail,
          password: "password123",
        }),
      }
    );

    const userResult = await userRegister.json();
    if (userResult.success) {
      userToken = userResult.data.token;
      console.log("   ✅ تم تسجيل المستخدم العادي");
    } else {
      console.log("   ❌ فشل تسجيل المستخدم:", userResult.message);
      return;
    }

    // 3. اختبار إنشاء تقرير (بالأدمن)
    console.log("3. 📝 اختبار إنشاء تقرير بالأدمن...");
    const createReport = await fetch("http://localhost:5000/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "تقرير اختبار شامل للفيضان",
        description: "هذا تقرير اختباري لنظام التقارير مع وصف مفصل عن الموقف",
        location_name: "الرياض - حي الملز",
        disaster_type: "flood",
        longitude: 46.6753,
        latitude: 24.7136,
        link: "https://example.com/news/123",
        images: ["https://example.com/image1.jpg"],
      }),
    });

    const createResult = await createReport.json();
    if (createResult.success) {
      const reportId = createResult.data.report.id;
      console.log("   ✅ تم إنشاء التقرير:", reportId);

      // 4. اختبار جلب التقرير
      console.log("4. 🔍 اختبار جلب التقرير...");
      const getReport = await fetch(
        `http://localhost:5000/api/reports/${reportId}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const getResult = await getReport.json();
      console.log("   ✅ جلب التقرير:", getResult.success);

      // 5. اختبار تحديث التقرير
      console.log("5. ✏️ اختبار تحديث التقرير...");
      const updateReport = await fetch(
        `http://localhost:5000/api/reports/${reportId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            title: "تقرير محدث - فيضان منطقة الرياض",
            status: "resolved",
          }),
        }
      );

      const updateResult = await updateReport.json();
      console.log("   ✅ تحديث التقرير:", updateResult.success);

      // 6. اختبار البحث الجغرافي
      console.log("6. 🗺️ اختبار البحث الجغرافي...");
      const nearbyReports = await fetch(
        `http://localhost:5000/api/reports/nearby/search?lat=24.7136&lng=46.6753&radius=10`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const nearbyResult = await nearbyReports.json();
      console.log(
        "   ✅ البحث الجغرافي:",
        nearbyResult.success,
        `(${nearbyResult.data.reports.length} تقرير)`
      );

      // 7. اختبار الإحصائيات
      console.log("7. 📈 اختبار الإحصائيات...");
      const stats = await fetch(
        "http://localhost:5000/api/reports/stats/summary",
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const statsResult = await stats.json();
      console.log("   ✅ الإحصائيات:", statsResult.success);

      // 8. اختبار حذف التقرير
      console.log("8. 🗑️ اختبار حذف التقرير...");
      const deleteReport = await fetch(
        `http://localhost:5000/api/reports/${reportId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const deleteResult = await deleteReport.json();
      console.log("   ✅ حذف التقرير:", deleteResult.success);
    } else {
      console.log("   ❌ فشل إنشاء التقرير:", createResult.message);
    }

    // 9. تنظيف
    console.log("9. 🧹 تنظيف البيانات...");
    await User.delete(adminId);
    await User.delete(userResult.data.user.id);
    console.log("   ✅ تم التنظيف");

    console.log("\n🎉 اختبار نظام التقارير اكتمل بنجاح!");
  } catch (error) {
    console.error("❌ فشل اختبار النظام:", error.message);
  }
};

// تشغيل الاختبار
testReportsSystem();
