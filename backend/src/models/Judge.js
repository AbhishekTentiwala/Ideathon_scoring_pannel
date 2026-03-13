import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const judgeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  designation: { type: String, trim: true },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

judgeSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

judgeSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

judgeSchema.set("toJSON", {
  transform: (_, o) => { delete o.passwordHash; return o; },
});

export default mongoose.model("Judge", judgeSchema);
