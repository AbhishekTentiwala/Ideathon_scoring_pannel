import "dotenv/config";
import express       from "express";
import { createServer } from "http";
import { Server }    from "socket.io";
import cors          from "cors";
import helmet        from "helmet";
import morgan        from "morgan";

import { connectDB } from "./config/db.js";
import { registerSockets } from "./sockets/liveSocket.js";
import { authRoutes, evaluationRoutes, startupRoutes } from "./routes/index.js";

await connectDB();

const buildAllowedOrigins = () => {
  const primaryOrigin = process.env.CLIENT_URL || "http://localhost:5500";
  const allowedOrigins = new Set([primaryOrigin]);

  try {
    const url = new URL(primaryOrigin);
    if (url.hostname === "localhost") {
      allowedOrigins.add(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ""}`);
    } else if (url.hostname === "127.0.0.1") {
      allowedOrigins.add(`${url.protocol}//localhost${url.port ? `:${url.port}` : ""}`);
    }
  } catch {
    // Fall back to the explicit origin only if CLIENT_URL is not a valid URL.
  }

  return [...allowedOrigins];
};

const allowedOrigins = buildAllowedOrigins();

const app    = express();
const server = createServer(app);
const io     = new Server(server, {
  cors: { origin: allowedOrigins },
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan("dev"));
app.use((req, _, next) => { req.io = io; next(); });

app.use("/api/auth",        authRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/startups",    startupRoutes);
app.get("/health",          (_, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ message: `${req.path} not found` }));
app.use((err, _req, res, _next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

registerSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
