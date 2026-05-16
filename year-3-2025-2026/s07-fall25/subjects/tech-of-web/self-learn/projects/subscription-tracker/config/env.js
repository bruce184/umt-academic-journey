// config/env.js
import { config } from 'dotenv';
import { resolve } from 'path';

const ENV = process.env.NODE_ENV ?? 'development';
config({ path: resolve(process.cwd(), `.env.${ENV}.local`) });

// no hard-code secrets in code
export const PORT = process.env.PORT ?? '3000';
export const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/subscription_tracker_dev';