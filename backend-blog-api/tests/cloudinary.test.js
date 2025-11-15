import fetch from "node-fetch";
import { User, Report } from "../src/models/index.js";

const testCloudinaryUpload = async () => {
  try {
    console.log("🧪 اختبار نظام Cloudinary (محدث)...\n");

    const timestamp = Date.now();
    let adminToken, adminId, reportId;

    // 1. تسجيل أدمن جديد
    console.log("1. 🔐 تسجيل أدمن جديد...");
    const adminEmail = `admin_cloudinary_${timestamp}@example.com`;

    const adminRegister = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "أدمن Cloudinary",
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

    // 2. اختبار إنشاء تقرير مع رفع صورة إلى Cloudinary
    console.log("2. ☁️ اختبار رفع صورة إلى Cloudinary...");

    // إنشاء صورة تجريبية صغيرة (1x1 pixel red image)
    const testImageBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    // تحويل base64 إلى blob
    const response = await fetch(testImageBase64);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("title", "تقرير اختبار Cloudinary");
    formData.append(
      "description",
      "هذا تقرير لاختبار نظام Cloudinary لرفع الصور"
    );
    formData.append("location_name", "موقع اختبار Cloudinary");
    formData.append("disaster_type", "flood");
    formData.append("longitude", "46.6753");
    formData.append("latitude", "24.7136");
    formData.append("images", blob, "test-image.png");

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
      console.log("   ✅ تم إنشاء التقرير مع Cloudinary:", reportId);

      // التحقق من أن الصور هي URLs صالحة
      const images = createResult.data.report.images;
      console.log("   📸 عدد الصور:", images.length);

      if (images && images.length > 0) {
        const firstImage = images[0];
        console.log("   🔗 نوع الصورة:", typeof firstImage);
        console.log("   🌐 رابط الصورة:", firstImage);

        // التحقق من أن الرابط يبدأ بـ https://
        if (
          typeof firstImage === "string" &&
          firstImage.startsWith("https://")
        ) {
          console.log("   ✅ الرابط صالح!");

          // 3. اختبار جلب التقرير
          console.log("3. 🔍 اختبار جلب التقرير من Cloudinary...");
          const getResponse = await fetch(
            `http://localhost:5000/api/reports/${reportId}`,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          );

          const getResult = await getResponse.json();
          console.log("   ✅ جلب التقرير:", getResult.success);

          if (getResult.success && getResult.data.report.images) {
            const retrievedImages = getResult.data.report.images;
            console.log("   📁 الصور المسترجعة:", retrievedImages.length);

            // 4. اختبار الوصول إلى الصور من Cloudinary
            console.log("4. ✅ اختبار الوصول إلى الصور من Cloudinary...");
            if (retrievedImages.length > 0) {
              const imageUrl = retrievedImages[0];
              try {
                const imageResponse = await fetch(imageUrl);
                console.log(
                  "   ✅ حالة الصورة من Cloudinary:",
                  imageResponse.status
                );

                if (imageResponse.ok) {
                  console.log("   🖼️  تم تحميل الصورة بنجاح من Cloudinary!");
                }
              } catch (imageError) {
                console.log("   ❌ خطأ في تحميل الصورة:", imageError.message);
              }
            }
          }
        } else {
          console.log("   ❌ الرابط غير صالح!");
        }
      }

      // 5. تنظيف
      console.log("5. 🧹 تنظيف البيانات من Cloudinary...");
      const deleteResponse = await fetch(
        `http://localhost:5000/api/reports/${reportId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const deleteResult = await deleteResponse.json();
      console.log("   ✅ حذف التقرير:", deleteResult.success);

      await User.delete(adminId);
      console.log("   ✅ تم تنظيف المستخدم");
    } else {
      console.log(
        "   ❌ فشل إنشاء التقرير مع Cloudinary:",
        createResult.message
      );
    }

    console.log("\n🎉 اختبار نظام Cloudinary اكتمل بنجاح!");
  } catch (error) {
    console.error("❌ فشل اختبار Cloudinary:", error.message);
  }
};

// تشغيل الاختبار
testCloudinaryUpload();
