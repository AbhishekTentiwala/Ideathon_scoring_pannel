import { Router } from "express";
import { login, getMe } from "../controllers/authController.js";
import { requireJudge } from "../middleware/auth.js";
import { requireSpecialAdmin } from "../middleware/specialAdmin.js";

const authRouter = Router();
authRouter.post("/login", login);
authRouter.get("/me", requireJudge, getMe);
export const authRoutes = authRouter;

import {
  submitEvaluation, getMyEvaluation, getMyProgress,
  getLeaderboard, getFullResults, getNonZeroLeaderboard,
} from "../controllers/evaluationController.js";

const evalRouter = Router();
evalRouter.post("/", requireJudge, submitEvaluation);
evalRouter.get("/my/:startupId", requireJudge, getMyEvaluation);
evalRouter.get("/progress", requireJudge, getMyProgress);
evalRouter.get("/leaderboard", getLeaderboard);
evalRouter.get("/admin/full", getFullResults);
evalRouter.get("/admin/non-zero-leaderboard", requireSpecialAdmin, getNonZeroLeaderboard);
export const evaluationRoutes = evalRouter;

import { getStartups, createStartup, updateStartup, deleteStartup } from "../controllers/startupController.js";

const startupRouter = Router();
startupRouter.get("/", getStartups);
startupRouter.post("/", requireSpecialAdmin, createStartup);
startupRouter.put("/:id", requireSpecialAdmin, updateStartup);
startupRouter.delete("/:id", requireSpecialAdmin, deleteStartup);
export const startupRoutes = startupRouter;
