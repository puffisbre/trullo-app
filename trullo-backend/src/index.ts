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
const PORT = parseInt(process.env.PORT || '4000', 10);

// CORS configuration - allow multiple origins
const defaultOrigins = ['http://localhost:3000', 'https://trullo-app-pi.vercel.app'];
const envOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

// Always include Vercel URL in production, merge with env origins
const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])];

console.log('CORS allowed origins:', allowedOrigins);
console.log('FRONTEND_URL env:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: No origin header, allowing request');
      return callback(null, true);
    }
    
    console.log('CORS: Checking origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Origin allowed:', origin);
      // Return the actual origin, not true, to ensure correct header
      callback(null, origin);
    } else {
      console.log('CORS: Origin NOT allowed:', origin);
      console.log('CORS: Allowed origins are:', allowedOrigins);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}, Allowed: ${allowedOrigins.join(', ')}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/tasks", authUser, taskRoutes);

(async () => {
  try {
    await connectDB();
    const host = '0.0.0.0'; // Listen on all interfaces for Docker/Render
    app.listen(PORT, host, () => {
      console.log(`Server is running on ${host}:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
})();

export default app;