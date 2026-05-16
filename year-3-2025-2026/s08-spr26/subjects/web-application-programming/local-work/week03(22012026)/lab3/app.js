import express from 'express';
import cors from 'cors';
import { responseMiddleware } from './middlewares/response-mw.js';
import { errorMiddleware } from './middlewares/error-mw.js';
import { AppError } from './utils/app-error.js';

import userRouter from './routers/user-r.js';
import todoRouter from './routers/todo-r.js';

const app = express();

app.use(cors());
app.use(express.json());

// Attach helpers to res
app.use(responseMiddleware);

app.get('/', (req, res) => {
  res.ok({ message: 'Welcome to Lab3 RESTful API', documentation: '/api/v1/docs' });
});

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/todos', todoRouter);

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorMiddleware);

export default app;
