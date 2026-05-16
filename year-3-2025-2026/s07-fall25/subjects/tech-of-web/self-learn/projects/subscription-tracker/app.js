import express from 'express';
import mongoose from 'mongoose';
import { PORT } from './config/env.js';
import connectDB from './database/mongodb.js';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import errorMiddleware from './middlewares/error.middlewares.js';

const app = express();
app.use(express.json()); // Allow to accept JSON data
app.use(cookieParser()); // Allow to parse cookies


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

app.use(errorMiddleware);

app.get('/', (req, res) => { res.send('Hello, world!'); });

// Start the app: connect to DB first, then start listening.
const start = async () => {
  try {
    await connectDB();
    app.listen(Number(PORT), () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start application', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.info('SIGINT received — closing server');
  try {
    await mongoose.connection.close(false);
    console.info('MongoDB connection closed');
  } catch (err) {
    console.error('Error while closing MongoDB connection', err);
  }
  process.exit(0);
});

export default app;