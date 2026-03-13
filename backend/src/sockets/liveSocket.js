import { MAX_TOTAL_SCORE } from "../models/Evaluation.js";
import Startup             from "../models/Startup.js";

export const registerSockets = (io) => {
  io.on("connection", async (socket) => {
    console.log(` Socket connected: ${socket.id}`);

    try {
      const startups = await Startup.find()
        .sort({ averageScore: -1, pitchOrder: 1 })
        .lean();

      const leaderboard = startups.map((s, i) => ({
        rank:             i + 1,
        id:               s._id,
        teamName:         s.teamName,
        projectTitle:     s.projectTitle,
        category:         s.category,
        averageScore:     s.averageScore,
        totalEvaluations: s.totalEvaluations,
        percentage:       Math.round((s.averageScore / MAX_TOTAL_SCORE) * 100),
      }));

      socket.emit("leaderboard:init", { leaderboard, maxScore: MAX_TOTAL_SCORE });
    } catch (err) {
      console.error("Socket init error:", err.message);
    }

    socket.on("disconnect", () => {
      console.log(` Socket disconnected: ${socket.id}`);
    });
  });
};
