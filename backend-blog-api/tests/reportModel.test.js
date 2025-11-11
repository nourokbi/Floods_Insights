import Report from "../src/models/Report.js";
import User from "../src/models/User.js";

const testReportModel = async () => {
  try {
    console.log("🧪 بدء اختبار نموذج التقرير...");

    // 1. إنشاء مستخدم أولاً (لأن التقرير يحتاج created_by)
    const testUser = {
      name: "مختبر التقارير",
      email: "report_tester@example.com",
      password: "password123",
      role: "admin",
    };

    const user = await User.create(testUser);
    console.log("✅ تم إنشاء المستخدم للاختبار:", user.id);

    // 2. اختبار إنشاء تقرير جديد
    const newReport = {
      title: "فيضان تجريبي في الرياض",
      description: "هذا تقرير تجريبي لاختبار النظام",
      location_name: "الرياض",
      disaster_type: "flood",
      status: "active",
      created_by: user.id,
      longitude: 46.6753,
      latitude: 24.7136,
    };

    const createdReport = await Report.create(newReport);
    console.log("✅ اختبار إنشاء التقرير:", createdReport.id);

    // 3. اختبار البحث بالمعرف
    const foundReport = await Report.findById(createdReport.id);
    console.log("✅ اختبار البحث بالمعرف:", foundReport.title);

    // 4. اختبار جلب جميع التقارير
    const allReports = await Report.findAll({}, 1, 5);
    console.log("✅ اختبار جلب جميع التقارير:", allReports.reports.length);

    // 5. اختبار البحث الجغرافي
    const nearbyReports = await Report.findByLocation(24.7136, 46.6753, 50);
    console.log("✅ اختبار البحث الجغرافي:", nearbyReports.length);

    // 6. اختبار الإحصائيات
    const stats = await Report.getStats();
    console.log("✅ اختبار الإحصائيات:", stats.totals);

    console.log("🎉 جميع اختبارات نموذج التقرير نجحت!");
  } catch (error) {
    console.error("❌ فشل اختبار نموذج التقرير:", error.message);
  }
};

// تشغيل الاختبار
testReportModel();
