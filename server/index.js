import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import weatherRoutes from "./routes/weather.route.js";

const app = express();

// ================= CORS =================
const allowedOrigins = [
  // "http://localhost:5173", // dev frontend
  "https://my-ai-assistant-khaki.vercel.app", // prod frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // important for sending cookies
  })
);

// ================= Middleware =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================= Routes =================
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/conversations", conversationRoutes);
app.use("/api/weather", weatherRoutes);
// app.use("/api/gemini", geminiRoutes);

// ================= DB + Server =================
const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("DB connection failed:", err));
