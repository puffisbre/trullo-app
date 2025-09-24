import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/dbConnection.ts";
import userRoutes from "./routes/userRoute.ts";
import taskRoutes from './routes/taskRoutes.ts';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

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