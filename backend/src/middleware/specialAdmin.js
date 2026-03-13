const SPECIAL_ADMIN_PASSWORD = process.env.SPECIAL_ADMIN_PASSWORD || "AdminadityaBhaiya";

export const requireSpecialAdmin = (req, res, next) => {
  const suppliedPassword =
    req.headers["x-special-admin-password"] ||
    req.headers["x-admin-password"];

  if (!suppliedPassword || suppliedPassword !== SPECIAL_ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid special admin password",
    });
  }

  next();
};
