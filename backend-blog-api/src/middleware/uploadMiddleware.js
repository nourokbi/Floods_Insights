import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import stream from "stream";

// إعداد multer للذاكرة (بدون تخزين محلي)
const storage = multer.memoryStorage();

// فلتر الملفات - نسمح بالصور فقط
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "نوع الملف غير مدعوم! يسمح برفع الصور فقط (JPEG, PNG, GIF, WebP)."
      ),
      false
    );
  }
};

// إعداد multer النهائي
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB حد أقصى للصورة
  },
  fileFilter: fileFilter,
});

// دالة لرفع الملف إلى Cloudinary
const uploadToCloudinary = (fileBuffer, folder = "disaster-reports") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto:good" },
        ],
        format: "webp",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          // نرجع الـ URL فقط
          resolve(result.secure_url);
        }
      }
    );

    // إنشاء stream من buffer ورفعه
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// دالة لحذف الملف من Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // استخراج public_id من الـ URL
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex !== -1) {
      const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
      const publicId = publicIdWithExtension.split(".")[0];

      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    }
    return { result: "not_found" };
  } catch (error) {
    console.error("خطأ في حذف الملف من Cloudinary:", error);
    throw error;
  }
};

// middleware للتعامل مع أخطاء multer
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "حجم الملف كبير جداً! الحد الأقصى 5MB",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "تم رفع عدد كبير جداً من الملفات! الحد الأقصى 5 صور",
      });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next();
};

export { upload, handleUploadErrors, uploadToCloudinary, deleteFromCloudinary };
