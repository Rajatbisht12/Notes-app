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


app.use((req, res, next) => {
  const allowedOrigins = [
    'https://notes-app-kohl-beta.vercel.app',
    'https://notes-kkpx8rcfv-rajat-bishts-projects.vercel.app',
    'http://localhost:3000',
    'https://notes-fwnltx242-rajat-bishts-projects.vercel.app'
  ];
  
  const origin = req.headers.origin;
  // Fix: Check if origin exists and is in allowedOrigins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(clerkMiddleware()); // Move before routes for auth
app.use('/api', router);



app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});