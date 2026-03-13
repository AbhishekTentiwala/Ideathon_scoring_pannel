import jwt   from "jsonwebtoken";
import Judge from "../models/Judge.js";

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const normalizedEmail = String(email).trim().toLowerCase();
    const judge = await Judge.findOne({ email: normalizedEmail });

    if (!judge) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[auth] Login failed: judge not found for ${normalizedEmail}`);
      }
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const passwordMatches = await judge.comparePassword(password);
    if (!passwordMatches) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[auth] Login failed: password mismatch for ${normalizedEmail}`);
      }
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!judge.isActive)
      return res.status(403).json({ success: false, message: "Account is inactive" });

    const token = jwt.sign({ id: judge._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    res.json({ success: true, token, judge: judge.toJSON() });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, judge: req.judge.toJSON() });
};
