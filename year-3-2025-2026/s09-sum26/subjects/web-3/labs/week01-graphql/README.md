# Week 01 GraphQL Lab

This lab is the first Web 3 backend exercise for Semester 9. It implements a small course enrollment GraphQL API with Node.js, Express, Apollo Server, PostgreSQL, Knex, JWT authentication, and DataLoader.

## What Is Included

- GraphQL schema and resolvers
- student/course enrollment mutations
- login with JWT authentication
- password hashing with bcrypt
- PostgreSQL migrations and sanitized seed data
- request payload examples under `collections/`
- Docker and Docker Compose setup files
- sanitized `.env.example`

## Local Run Notes

1. Copy `.env.example` to `.env` and replace placeholder values.
2. Install dependencies with `npm install`.
3. Start PostgreSQL with Docker Compose or use a local PostgreSQL instance.
4. Run migrations with `npm run migrate`.
5. Run seed data with `npm run seed`.
6. Start the API with `npm run dev` or `npm start`.

The GraphQL endpoint is `/graphql`, defaulting to `http://localhost:4000/graphql`.

## Curation Notes

The original local folder also contains `.env`, `.env.docker`, `node_modules/`, and captured response data. Those are intentionally excluded or replaced with placeholders in this repo copy.