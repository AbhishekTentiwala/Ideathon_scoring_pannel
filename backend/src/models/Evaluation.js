import mongoose from "mongoose";

export const CRITERIA = [
  { key: "Q1", label: "Problem Statement", weightage: 1, maxScore: 5 },
  { key: "Q2", label: "Solution Provided", weightage: 1, maxScore: 5 },
  { key: "Q3", label: "USP", weightage: 2, maxScore: 10 },
  { key: "Q4", label: "Market Scalability Potential", weightage: 4, maxScore: 20 },
  { key: "Q5", label: "Presentation", weightage: 3, maxScore: 15 },
  { key: "Q6", label: "Founder's Knowledge & Confidence", weightage: 2, maxScore: 10 },
  { key: "Q7", label: "Answers to Jury Question", weightage: 3, maxScore: 15 },
  { key: "Q8", label: "Other", weightage: 1, maxScore: 5 },
];

export const MAX_TOTAL_SCORE = CRITERIA.reduce((s, c) => s + c.maxScore, 0);
const ratingField = { type: Number, min: 1, max: 5, required: true };

const evaluationSchema = new mongoose.Schema({
  judgeId: { type: mongoose.Schema.Types.ObjectId, ref: "Judge", required: true },
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: "Startup", required: true },

  ratings: {
    Q1: ratingField,
    Q2: ratingField,
    Q3: ratingField,
    Q4: ratingField,
    Q5: ratingField,
    Q6: ratingField,
    Q7: ratingField,
    Q8: ratingField,
  },

  calculatedScore: { type: Number },

  breakdown: [
    {
      key: String,
      label: String,
      stars: Number,
      weightage: Number,
      score: Number,
    },
  ],

  notes: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true });

evaluationSchema.index({ judgeId: 1, startupId: 1 }, { unique: true });

evaluationSchema.pre("save", function (next) {
  if (!this.isModified("ratings")) return next();

  let total = 0;
  const breakdown = [];

  CRITERIA.forEach(({ key, label, weightage }) => {
    const stars = this.ratings[key] || 0;
    const score = stars * weightage;
    total += score;
    breakdown.push({ key, label, stars, weightage, score });
  });

  this.calculatedScore = total;
  this.breakdown = breakdown;
  next();
});

export default mongoose.model("Evaluation", evaluationSchema);
