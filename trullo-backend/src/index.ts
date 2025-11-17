import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/dbConnection.ts";
import userRoutes from "./routes/userRoute.ts";
import taskRoutes from './routes/taskRoutes.ts';
import authUser from "./middlewares/authentication.ts";
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/tasks", authUser, taskRoutes);

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
})();

export default app;