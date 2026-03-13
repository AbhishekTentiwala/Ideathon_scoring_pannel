import Startup from "../models/Startup.js";
export const getStartups = async (req, res, next) => {
  try {
    const startups = await Startup.find()
      .sort({ pitchOrder: 1 })
      .select("-__v");
    res.json({ success: true, startups });
  } catch (err) { next(err); }
};

export const createStartup = async (req, res, next) => {
  try {
    const s = await Startup.create(req.body);
    res.status(201).json({ success: true, startup: s });
  } catch (err) { next(err); }
};

export const deleteStartup = async (req, res, next) => {
  try {
    await Startup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};
