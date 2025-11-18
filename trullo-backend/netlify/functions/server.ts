import serverless from 'serverless-http';
import app from '../../src/index.ts';
import { connectDB } from '../../src/db/dbConnection.ts';

// Initialize database connection
connectDB().catch(console.error);

// Wrap Express app with serverless-http
export const handler = serverless(app);

