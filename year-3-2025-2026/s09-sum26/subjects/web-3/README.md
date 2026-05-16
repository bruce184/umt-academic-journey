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

Main local entry points:

- `server.js`
- `schema.js`
- `resolvers.js`
- `auth.js`
- `loaders.js`
- `db/`
- `package.json`

## Curation Notes

Keep source, schema, migrations, seeds, request examples, and concise notes when this lab is migrated into the repo. Do not commit `node_modules/`, `.env`, database runtime files, or local containers/build artifacts.

The local folder also contains a separate Java backend learning repository. It is useful supporting study material, but should stay separate unless intentionally consolidated later.
