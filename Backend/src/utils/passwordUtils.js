import bcrypt from "bcryptjs";

const passwordUtils = {
  // تشفير كلمة المرور
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },

  // التحقق من كلمة المرور
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // التحقق من قوة كلمة المرور
  validatePasswordStrength(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return { isValid: false, message: "كلمة المرور يجب أن تكون至少 6 أحرف" };
    }

    return { isValid: true, message: "كلمة المرور قوية" };
  },
};

export default passwordUtils;
