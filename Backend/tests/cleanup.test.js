import db from "../src/config/database.js";

const cleanupTestData = async () => {
  try {
    console.log("🧹 بدء تنظيف جميع البيانات الاختبارية...");

    // الترتيب مهم بسبب العلاقات (CASCADE سيهتم بالباقي)
    await db("bookmarks").where("id", ">", 0).delete();
    await db("likes").where("id", ">", 0).delete();
    await db("comments").where("id", ">", 0).delete();
    await db("reports").where("id", ">", 0).delete();
    await db("users").where("email", "!=", "admin@disaster.com").delete();

    console.log("✅ تم تنظيف جميع البيانات الاختبارية بنجاح");
  } catch (error) {
    console.error("❌ فشل في التنظيف:", error.message);
  } finally {
    process.exit(0);
  }
};

cleanupTestData();
