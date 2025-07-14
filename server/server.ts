// server.ts - Updated with correct port configuration
import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import { errorHandler } from './utils/errorHandler';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 


app.use(cors({
  origin: 'https://notes-app-kohl-beta.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(clerkMiddleware()); // Move before routes for auth
app.use('/api', router);



app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});