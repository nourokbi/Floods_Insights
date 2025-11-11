import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

// إعدادات اتصال قاعدة البيانات
const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "disaster_monitoring",
  },
  pool: { min: 2, max: 10 },
  useNullAsDefault: true,
});

// اختبار الاتصال
db.raw("SELECT 1")
  .then(() => {
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
  })
  .catch((error) => {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", error.message);
  });

export default db;
