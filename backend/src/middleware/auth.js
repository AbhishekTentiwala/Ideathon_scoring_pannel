import jwt from "jsonwebtoken";
import Judge from "../models/Judge.js";

export const requireJudge = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "No token" });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.judge = await Judge.findById(id);
    if (!req.judge?.isActive)
      return res.status(401).json({ success: false, message: "Account inactive" });
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
