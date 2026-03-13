import Evaluation, { CRITERIA, MAX_TOTAL_SCORE } from "../models/Evaluation.js";
import Startup from "../models/Startup.js";
import Judge from "../models/Judge.js";

export const submitEvaluation = async (req, res, next) => {
  try {
    const { startupId, ratings, notes } = req.body;
    const judgeId = req.judge._id;

    for (const { key } of CRITERIA) {
      const v = ratings?.[key];
      if (!v || v < 1 || v > 5)
        return res.status(400).json({
          success: false,
          message: `${key} must be between 1 and 5 stars`,
        });
    }

    const startup = await Startup.findById(startupId);
    if (!startup)
      return res.status(404).json({ success: false, message: "Startup not found" });


    let evaluation = await Evaluation.findOne({ judgeId, startupId });
    if (evaluation) {
      evaluation.ratings = ratings;
      evaluation.notes = notes || "";
      evaluation.markModified("ratings"); // Force Mongoose to trigger pre-save hook
    } else {
      evaluation = new Evaluation({ judgeId, startupId, ratings, notes: notes || "" });
    }
    await evaluation.save();

    const allEvals = await Evaluation.find({ startupId });
    const avgScore = allEvals.length > 0
      ? allEvals.reduce((s, e) => s + e.calculatedScore, 0) / allEvals.length
      : 0;

    await Startup.findByIdAndUpdate(startupId, {
      averageScore: Math.round(avgScore * 100) / 100,
      totalEvaluations: allEvals.length,
    });


    const leaderboard = await buildLeaderboard();
    req.io?.emit("leaderboard:updated", { leaderboard });

    res.status(201).json({
      success: true,
      message: "Evaluation saved!",
      evaluation: {
        id: evaluation._id,
        calculatedScore: evaluation.calculatedScore,
        breakdown: evaluation.breakdown,
        maxScore: MAX_TOTAL_SCORE,
        percentage: Math.round((evaluation.calculatedScore / MAX_TOTAL_SCORE) * 100),
      },
    });
  } catch (err) {
    next(err);
  }
};


export const getMyEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findOne({
      judgeId: req.judge._id,
      startupId: req.params.startupId,
    });
    res.json({ success: true, evaluation });
  } catch (err) {
    next(err);
  }
};

export const getMyProgress = async (req, res, next) => {
  try {
    const evaluated = await Evaluation.find({ judgeId: req.judge._id })
      .select("startupId calculatedScore")
      .lean();

    const map = {};
    evaluated.forEach(e => { map[e.startupId.toString()] = e.calculatedScore; });
    res.json({ success: true, evaluated: map });
  } catch (err) {
    next(err);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await buildLeaderboard();
    res.json({ success: true, leaderboard, maxScore: MAX_TOTAL_SCORE });
  } catch (err) {
    next(err);
  }
};


export const getFullResults = async (req, res, next) => {
  try {
    const startups = await Startup.find().sort({ averageScore: -1 });
    const judges = await Judge.find().select("name email");

    const rows = await Promise.all(
      startups.map(async (s) => {
        const evals = await Evaluation.find({ startupId: s._id })
          .populate("judgeId", "name")
          .lean();

        const judgeScores = {};
        evals.forEach(e => {
          judgeScores[e.judgeId._id.toString()] = {
            name: e.judgeId.name,
            score: e.calculatedScore,
            breakdown: e.breakdown,
          };
        });

        return {
          startup: s,
          judgeScores,
          averageScore: s.averageScore,
          evaluated: s.totalEvaluations,
        };
      })
    );

    res.json({ success: true, rows, judges, maxScore: MAX_TOTAL_SCORE, criteria: CRITERIA });
  } catch (err) {
    next(err);
  }
};


async function buildLeaderboard() {
  const startups = await Startup.find()
    .sort({ averageScore: -1, pitchOrder: 1 })
    .lean();

  return startups.map((s, i) => ({
    rank: i + 1,
    id: s._id,
    teamName: s.teamName,
    projectTitle: s.projectTitle,
    category: s.category,
    averageScore: s.averageScore,
    totalEvaluations: s.totalEvaluations,
    percentage: Math.round((s.averageScore / MAX_TOTAL_SCORE) * 100),
  }));
}
