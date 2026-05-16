# Web 3

This subject folder tracks Web 3 coursework for Semester 9, curated from the local `3.JUNIOR/SEM9/WEB 3` folder.

## Current Local Materials

### Week 1 - 2026-05-09

- `Tuan00_GioiThieu.pdf`: course introduction material.
- `Tuan01_GraphQL.pdf`: GraphQL lecture material.
- `lab01/`: GraphQL backend lab.
- `collections/`: request payloads for creating students/courses, enrollment, login, and queries.

### Week 2 - 2026-05-16

- `Tuan02_gRPC.pdf`: gRPC lecture material.

## Lab 01 - GraphQL Backend

The first lab is a Node.js GraphQL service with:

- Express 5 and Apollo Server
- PostgreSQL access through Knex
- migrations and seed data
- JWT-based login/authentication
- bcrypt password hashing
- DataLoader for relationship loading
- Docker and Docker Compose setup files

Repo copy:

- `labs/week01-graphql/`

The repo copy includes source, package files, Docker files, migrations, sanitized seed data, sanitized request examples, `.gitignore`, `.env.example`, and lab notes.

## Curation Notes

The uploaded lab intentionally excludes `node_modules/`, `.env`, `.env.docker`, real JWT/session data, database runtime files, local containers, and build artifacts.

The local folder also contains a separate Java backend learning repository. It is useful supporting study material, but should stay separate unless intentionally consolidated later.
