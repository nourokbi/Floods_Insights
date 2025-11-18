import fetch from "node-fetch";
import { User } from "../src/models/index.js";

const testAuth = async () => {
  try {
    console.log("🧪 بدء اختبار نظام المصادقة...\n");

    const timestamp = Date.now();
    const testEmail = `auth_test_${timestamp}@example.com`;

    // 1. اختبار تسجيل مستخدم جديد
    console.log("1. 📝 اختبار تسجيل مستخدم جديد...");

    const registerResponse = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "مستخدم اختبار المصادقة",
          email: testEmail,
          password: "password123",
        }),
      }
    );

    const registerResult = await registerResponse.json();
    console.log("   ✅ حالة التسجيل:", registerResult.success);

    if (!registerResult.success) {
      console.log("   ❌ سبب فشل التسجيل:", registerResult.message);
      console.log(
        "   🔍 تفاصيل الاستجابة:",
        JSON.stringify(registerResult, null, 2)
      );
      return;
    }

    const token = registerResult.data.token;
    console.log("   ✅ تم الحصول على Token");

    // 2. اختبار تسجيل الدخول
    console.log("2. 🔐 اختبار تسجيل الدخول...");

    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: "password123",
      }),
    });

    const loginResult = await loginResponse.json();
    console.log("   ✅ حالة تسجيل الدخول:", loginResult.success);

    if (!loginResult.success) {
      console.log("   ❌ سبب فشل تسجيل الدخول:", loginResult.message);
      return;
    }

    // 3. اختبار جلب بيانات المستخدم
    console.log("3. 👤 اختبار جلب بيانات المستخدم...");

    const meResponse = await fetch("http://localhost:5000/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const meResult = await meResponse.json();
    console.log("   ✅ حالة جلب البيانات:", meResult.success);

    if (meResult.success) {
      console.log("   ✅ اسم المستخدم:", meResult.data.user.name);
    } else {
      console.log("   ❌ سبب فشل جلب البيانات:", meResult.message);
    }

    // تنظيف
    console.log("4. 🧹 تنظيف البيانات...");
    await User.delete(registerResult.data.user.id);
    console.log("   ✅ تم تنظيف بيانات الاختبار");

    console.log("\n🎉 اختبار المصادقة اكتمل بنجاح!");
  } catch (error) {
    console.error("❌ فشل اختبار المصادقة:", error.message);
    console.error("🔧 تفاصيل الخطأ:", error);
  }
};

// تشغيل الاختبار
testAuth();
