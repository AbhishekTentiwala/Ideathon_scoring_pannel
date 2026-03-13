import mongoose from "mongoose";

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ MongoDB: ${conn.connection.host}/${conn.connection.name}`);

  if (process.env.NODE_ENV !== "production" && conn.connection.name === "test") {
    console.warn("[db] Connected to the default `test` database. Check MONGO_URI if you expected a named database.");
  }
};
