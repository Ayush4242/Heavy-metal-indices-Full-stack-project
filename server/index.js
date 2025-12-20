import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import pollutionRoutes from "./routes/pollutionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js"; // 👈 all lowercase

dotenv.config();
connectDB();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// health route
app.get("/", (req, res) => {
  res.json({ msg: "API is running..." });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/pollution", pollutionRoutes);
app.use("/api/quiz", quizRoutes); // 👈 quiz routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
