import db from "../config/database.js";

// دالة مساعدة لمعالجة الصور في الاستجابة
const processImagesForResponse = (report) => {
  if (!report) return report;

  // تأكد من أن images هي مصفوفة من strings (URLs)
  if (report.images && Array.isArray(report.images)) {
    return {
      ...report,
      images: report.images.map((img) => {
        if (typeof img === "string") return img;
        if (typeof img === "object" && img.url) return img.url;
        return String(img);
      }),
    };
  }

  return report;
};

const Report = {
  async create(reportData) {
    try {
      const { longitude, latitude, ...cleanData } = reportData;

      const [report] = await db("reports")
        .insert({
          ...cleanData,
          location_coordinates: db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [
            longitude,
            latitude,
          ]),
        })
        .returning("*");

      return processImagesForResponse(report);
    } catch (error) {
      throw new Error(`فشل في إنشاء التقرير: ${error.message}`);
    }
  },

  async findById(id) {
    try {
      const report = await db("reports")
        .where({ "reports.id": id })
        .leftJoin("users", "reports.created_by", "users.id")
        .select(
          "reports.*",
          "users.name as author_name",
          "users.email as author_email",
          db.raw("ST_X(location_coordinates) as longitude"),
          db.raw("ST_Y(location_coordinates) as latitude"),
          db.raw(
            "(SELECT COUNT(*) FROM comments WHERE report_id = reports.id) as comments_count"
          ),
          db.raw(
            "(SELECT COUNT(*) FROM likes WHERE report_id = reports.id) as likes_count"
          ), // ⭐ إضافة هذا السطر
          db.raw(
            "(SELECT COUNT(*) FROM bookmarks WHERE report_id = reports.id) as bookmarks_count"
          )
        )
        .first();

      return processImagesForResponse(report);
    } catch (error) {
      throw new Error(`فشل في البحث عن التقرير: ${error.message}`);
    }
  },

  async findAll(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = db("reports")
        .leftJoin("users", "reports.created_by", "users.id")
        .select(
          "reports.*",
          "users.name as author_name",
          db.raw("ST_X(location_coordinates) as longitude"),
          db.raw("ST_Y(location_coordinates) as latitude"),
          db.raw(
            "(SELECT COUNT(*) FROM comments WHERE report_id = reports.id) as comments_count"
          ),
          db.raw(
            "(SELECT COUNT(*) FROM likes WHERE report_id = reports.id) as likes_count"
          ),
          db.raw(
            "(SELECT COUNT(*) FROM bookmarks WHERE report_id = reports.id) as bookmarks_count"
          )
        );

      if (filters.disaster_type) {
        query = query.where("reports.disaster_type", filters.disaster_type);
      }
      if (filters.status) {
        query = query.where("reports.status", filters.status);
      }
      if (filters.user_id) {
        query = query.where("reports.created_by", filters.user_id);
      }

      const reports = await query
        .limit(limit)
        .offset(offset)
        .orderBy("reports.created_at", "desc");

      // معالجة الصور في جميع التقارير
      const processedReports = reports.map(processImagesForResponse);

      let countQuery = db("reports");
      if (filters.disaster_type)
        countQuery = countQuery.where("disaster_type", filters.disaster_type);
      if (filters.status)
        countQuery = countQuery.where("status", filters.status);
      if (filters.user_id)
        countQuery = countQuery.where("created_by", filters.user_id);

      const total = await countQuery.count("* as count").first();

      return {
        reports: processedReports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          totalPages: Math.ceil(total.count / limit),
        },
      };
    } catch (error) {
      throw new Error(`فشل في جلب التقارير: ${error.message}`);
    }
  },

  async update(id, updateData) {
    try {
      const { longitude, latitude, ...cleanData } = updateData;
      const updateFields = { ...cleanData };

      if (longitude && latitude) {
        updateFields.location_coordinates = db.raw(
          `ST_SetSRID(ST_MakePoint(?, ?), 4326)`,
          [longitude, latitude]
        );
      }

      const [report] = await db("reports")
        .where({ id })
        .update(updateFields)
        .returning("*");

      return processImagesForResponse(report);
    } catch (error) {
      throw new Error(`فشل في تحديث التقرير: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      await db("reports").where({ id }).delete();
      return true;
    } catch (error) {
      throw new Error(`فشل في حذف التقرير: ${error.message}`);
    }
  },

  async findByLocation(lat, lng, radius = 10) {
    try {
      const reports = await db("reports")
        .select(
          "*",
          db.raw("ST_X(location_coordinates) as longitude"),
          db.raw("ST_Y(location_coordinates) as latitude"),
          db.raw(
            `ST_Distance(
            location_coordinates, 
            ST_SetSRID(ST_MakePoint(?, ?), 4326)
          ) as distance_meters`,
            [lng, lat]
          )
        )
        .whereRaw(
          `ST_DWithin(
            location_coordinates, 
            ST_SetSRID(ST_MakePoint(?, ?), 4326), 
            ?
          )`,
          [lng, lat, radius * 1000]
        )
        .orderBy("distance_meters", "asc");

      return reports.map(processImagesForResponse);
    } catch (error) {
      throw new Error(`فشل في البحث الجغرافي: ${error.message}`);
    }
  },

  async getStats() {
    try {
      const stats = await db("reports")
        .select("disaster_type")
        .select(db.raw("COUNT(*) as count"))
        .select(
          db.raw("COUNT(*) FILTER (WHERE status = 'active') as active_count")
        )
        .groupBy("disaster_type")
        .orderBy("count", "desc");

      const totalStats = await db("reports")
        .select(
          db.raw("COUNT(*) as total_reports"),
          db.raw("COUNT(*) FILTER (WHERE status = 'active') as active_reports"),
          db.raw(
            "COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports"
          )
        )
        .first();

      return {
        by_type: stats,
        totals: totalStats,
      };
    } catch (error) {
      throw new Error(`فشل في جلب إحصائيات التقارير: ${error.message}`);
    }
  },
};

export default Report;
