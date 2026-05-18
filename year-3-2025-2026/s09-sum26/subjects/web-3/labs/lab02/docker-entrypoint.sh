#!/bin/sh
set -e

if [ -n "$DB_NAME" ]; then
  echo "--- Ensuring Database $DB_NAME ---"
  node --input-type=commonjs <<'NODE'
const { Client } = require("pg");

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function main() {
  const database = process.env.DB_NAME;
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_ADMIN_DATABASE || "postgres"
  });

  await client.connect();

  const result = await client.query(
    "select 1 from pg_database where datname = $1",
    [database]
  );

  if (result.rowCount === 0) {
    await client.query(`create database ${quoteIdentifier(database)}`);
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE
fi

echo "--- Running Migrations ---"
npm run migrate

if [ "$NEED_SEED" = "true" ]; then
  echo "--- Running Seeds ---"
  npm run seed
fi

echo "--- Starting Service ---"
exec "$@"
