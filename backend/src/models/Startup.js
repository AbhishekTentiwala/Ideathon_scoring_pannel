import mongoose from "mongoose";

const startupSchema = new mongoose.Schema({
  teamName: { type: String, required: true, trim: true },
  projectTitle: { type: String, trim: true },
  founders: { type: String, trim: true },
  description: { type: String, trim: true },
  category: { type: String, trim: true },
  pitchOrder: { type: Number, required: true },

  averageScore: { type: Number, default: 0 },
  totalEvaluations: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Startup", startupSchema);


