import fetch from "node-fetch";
import { User, Report } from "../src/models/index.js";
import fs from "fs";

// إنشاء صورة تجريبية صغيرة للاختبار
const createTestImage = () => {
  const testImagePath = "./test-image.jpg";

  // إذا لم توجد صورة اختبار، ننشئ واحدة بسيطة
  if (!fs.existsSync(testImagePath)) {
    console.log("⚠️  لم يتم العثور على صورة اختبار، سيتم استخدام بيانات وهمية");
    return null;
  }

  return testImagePath;
};

const testFileUpload = async () => {
  try {
    console.log("🧪 اختبار نظام رفع الصور...\n");

    const timestamp = Date.now();
    let adminToken, adminId, reportId;

    // 1. تسجيل أدمن جديد
    console.log("1. 🔐 تسجيل أدمن جديد...");
    const adminEmail = `admin_upload_${timestamp}@example.com`;

    const adminRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "أدمن رفع الملفات",
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

    // 2. اختبار إنشاء تقرير مع صورة
    console.log("2. 📸 اختبار إنشاء تقرير مع صورة...");

    const formData = new FormData();
    formData.append("title", "تقرير اختبار رفع الصور");
    formData.append("description", "هذا تقرير لاختبار نظام رفع الصور والملفات");
    formData.append("location_name", "موقع اختبار الرفع");
    formData.append("disaster_type", "flood");
    formData.append("longitude", "46.6753");
    formData.append("latitude", "24.7136");

    // محاولة إضافة صورة اختبار إذا كانت موجودة
    const testImagePath = createTestImage();
    if (testImagePath) {
      const imageBuffer = fs.readFileSync(testImagePath);
      const blob = new Blob([imageBuffer], { type: "image/jpeg" });
      formData.append("images", blob, "test-image.jpg");
    }

    const createResponse = await fetch("http://localhost:5000/api/reports", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    const createResult = await createResponse.json();

    if (createResult.success) {
      reportId = createResult.data.report.id;
      console.log("   ✅ تم إنشاء التقرير مع الصور:", reportId);
      console.log("   📁 الصور المرفوعة:", createResult.data.report.images);

      // 3. اختبار جلب التقرير مع الصور
      console.log("3. 🔍 اختبار جلب التقرير مع الصور...");
      const getResponse = await fetch(
        `http://localhost:5000/api/reports/${reportId}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const getResult = await getResponse.json();
      console.log("   ✅ جلب التقرير:", getResult.success);

      if (getResult.success && getResult.data.report.images) {
        console.log("   🖼️  الصور في التقرير:", getResult.data.report.images);

        // 4. اختبار الوصول إلى الصور
        console.log("4. 🌐 اختبار الوصول إلى الصور...");
        if (getResult.data.report.images.length > 0) {
          const imageUrl = `http://localhost:5000${getResult.data.report.images[0]}`;
          const imageResponse = await fetch(imageUrl);
          console.log("   ✅ حالة الصورة:", imageResponse.status);
        }
      }

      // 5. تنظيف
      console.log("5. 🧹 تنظيف البيانات...");
      await Report.delete(reportId);
      await User.delete(adminId);
      console.log("   ✅ تم التنظيف");
    } else {
      console.log("   ❌ فشل إنشاء التقرير:", createResult.message);
    }

    console.log("\n🎉 اختبار نظام رفع الصور اكتمل!");
  } catch (error) {
    console.error("❌ فشل اختبار الرفع:", error.message);
  }
};

// تشغيل الاختبار
testFileUpload();
