import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

// determine ssl requirement
const envSsl = (process.env.PGSSLMODE || "").toLowerCase() === "require";
const hostLooksLikeRemote = (
  process.env.DB_HOST ||
  process.env.DATABASE_URL ||
  ""
).includes("render.com");
const needSsl =
  envSsl || process.env.NODE_ENV === "production" || hostLooksLikeRemote;
const sslConfig = needSsl ? { rejectUnauthorized: false } : undefined;

// prefer a full connection string (DATABASE_URL) or a DB_HOST that is a uri
const connectionString = process.env.DATABASE_URL || process.env.DB_HOST;

let connectionConfig;
if (connectionString) {
  // if SSL needed, provide object with connectionString + ssl
  connectionConfig = needSsl
    ? { connectionString, ssl: sslConfig }
    : connectionString;
} else {
  connectionConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "disaster_monitoring",
    ...(needSsl ? { ssl: sslConfig } : {}),
  };
}

const db = knex({
  client: "pg",
  connection: connectionConfig,
  pool: { min: 2, max: 10 },
  useNullAsDefault: true,
  // optional: increase acquire timeout if network is slow
  acquireConnectionTimeout: 10000,
});

// اختبار الاتصال — show full error for debugging
db.raw("SELECT 1")
  .then(() => {
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
  })
  .catch((error) => {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", error.message);
    console.error(error.stack || error);
  });

export default db;
