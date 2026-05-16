import 'dotenv/config';
import app from './app.js';
import db from './db/db.js';
import https from 'https';
import fs from 'fs';
import path from 'path';

// const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

function readTlsOptions() {
  const KeyPath = path.resolve(process.env.SSL_KEY_PATH);
  const CertPath = path.resolve(process.env.SSL_CERT_PATH);

  return {
    key: fs.readFileSync(KeyPath),
    cert: fs.readFileSync(CertPath),
  };
}

const httpsServer = https.createServer(readTlsOptions(), app);

//Test DB Connection then start server 
async function startServer(){
  try{
    await db.raw('SELECT 1+1 AS result');
    console.log('Database connection established successfully.');

    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`HTTPS Server listening on port: https://localhost:${HTTPS_PORT}`);
    })

  }catch(err){
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  } 
}

startServer();
