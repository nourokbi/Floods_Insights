import User from "../src/models/User.js";

// اختبار نموذج المستخدم
const testUserModel = async () => {
  try {
    console.log("🧪 بدء اختبار نموذج المستخدم...");

    // 1. اختبار إنشاء مستخدم جديد
    const newUser = {
      name: "مستخدم تجريبي",
      email: "test@example.com",
      password: "password123",
      role: "user",
    };

    const createdUser = await User.create(newUser);
    console.log("✅ اختبار الإنشاء:", createdUser);

    // 2. اختبار البحث بالبريد الإلكتروني
    const foundUser = await User.findByEmail("test@example.com");
    console.log("✅ اختبار البحث بالبريد:", foundUser);

    // 3. اختبار البحث بالمعرف
    const userById = await User.findById(createdUser.id);
    console.log("✅ اختبار البحث بالمعرف:", userById);

    console.log("🎉 جميع اختبارات نموذج المستخدم نجحت!");
  } catch (error) {
    console.error("❌ فشل اختبار نموذج المستخدم:", error.message);
  }
};

// تشغيل الاختبار
testUserModel();
