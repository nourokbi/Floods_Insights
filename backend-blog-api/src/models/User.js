import db from "../config/database.js";

/**
 * نموذج المستخدم - User Model
 * للتعامل مع جدول users في قاعدة البيانات
 */
const User = {
  /**
   * إنشاء مستخدم جديد
   */
  async create(userData) {
    try {
      const [user] = await db("users").insert(userData).returning("*");
      return user;
    } catch (error) {
      throw new Error(`فشل في إنشاء المستخدم: ${error.message}`);
    }
  },

  /**
   * البحث عن مستخدم بالبريد الإلكتروني
   */
  async findByEmail(email) {
    try {
      const user = await db("users").where({ email }).first();
      return user;
    } catch (error) {
      throw new Error(`فشل في البحث عن المستخدم: ${error.message}`);
    }
  },

  /**
   * البحث عن مستخدم بالمعرف
   */
  async findById(id) {
    try {
      const user = await db("users")
        .where({ id })
        .select("id", "name", "email", "role", "created_at")
        .first();
      return user;
    } catch (error) {
      throw new Error(`فشل في البحث عن المستخدم: ${error.message}`);
    }
  },

  /**
   * تحديث بيانات المستخدم
   */
  async update(id, updateData) {
    try {
      const [user] = await db("users")
        .where({ id })
        .update(updateData)
        .returning(["id", "name", "email", "role", "created_at"]);
      return user;
    } catch (error) {
      throw new Error(`فشل في تحديث المستخدم: ${error.message}`);
    }
  },

  /**
   * حذف مستخدم
   */
  async delete(id) {
    try {
      await db("users").where({ id }).delete();
      return true;
    } catch (error) {
      throw new Error(`فشل في حذف المستخدم: ${error.message}`);
    }
  },

  /**
   * الحصول على جميع المستخدمين (مع pagination)
   */
  async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const users = await db("users")
        .select("id", "name", "email", "role", "created_at")
        .limit(limit)
        .offset(offset)
        .orderBy("created_at", "desc");

      const total = await db("users").count("* as count").first();

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / limit),
        },
      };
    } catch (error) {
      throw new Error(`فشل في جلب المستخدمين: ${error.message}`);
    }
  },

  /**
   * التحقق من وجود مستخدم بالبريد الإلكتروني
   */
  async emailExists(email) {
    try {
      const user = await db("users").where({ email }).first();
      return !!user;
    } catch (error) {
      throw new Error(`فشل في التحقق من البريد الإلكتروني: ${error.message}`);
    }
  },
};

export default User;
