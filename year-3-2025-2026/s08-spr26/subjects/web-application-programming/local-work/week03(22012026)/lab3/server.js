import 'dotenv/config';
import app from './app.js';
import db from './db/db.js';

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Check DB connection
    await db.raw('SELECT 1+1 AS result');
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
})();
