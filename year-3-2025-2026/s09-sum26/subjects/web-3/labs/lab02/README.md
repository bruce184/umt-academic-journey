# Lab 02 - gRPC Microservices With GraphQL Gateway

This lab implements a small distributed backend for managing students, courses, and enrollments.

## What Is Included

- `services/student-service`
  - gRPC service for student data, migrations, and seed data
- `services/course-service`
  - gRPC service for course data, migrations, and seed data
- `services/enrollment-service`
  - gRPC service for enrollment data and cross-service lookups
- `graphql-server`
  - Apollo/Express GraphQL API gateway that calls the gRPC services
- `protos`
  - protocol buffer definitions for the three services
- `docker-compose.yml`
  - PostgreSQL plus all backend services wired together for local development

## Running With Docker

```bash
cp .env.example .env.docker
docker compose up --build
```

The GraphQL endpoint runs at `http://localhost:4000/graphql` by default.

## Curation Notes

Generated dependencies such as `node_modules`, local `.env` files, and zip submissions are intentionally excluded from the repository. Install dependencies from the included lockfiles when running services outside Docker.
