# Java Backend Learning Journey

A structured self-study repository that takes you from core Java fundamentals to practical backend engineering with Maven, testing, SQL, Spring Boot, Docker, CI/CD, and capstone projects.

This repository is organized as a long-form learning journey instead of a single app. It is designed to help you study in phases, keep practice code separated by topic, and grow from beginner-level CLI programs to stronger backend projects with a more production-aware mindset.

## Goals

- Build a solid foundation in core Java before jumping into frameworks.
- Move from standalone `.java` files to structured Maven-based projects.
- Practice testing, debugging, SQL, JDBC/JPA, and Spring Boot REST API development.
- Learn harder backend topics step by step: architecture, security, transactions, observability, Docker, and CI/CD.
- Keep study notes, code exercises, mini projects, and capstones in one clean repository.

## Learning Roadmap

### Phase 1: Beginner

- Duration: 5 weeks, 25 sessions
- Focus: Java setup, syntax, control flow, OOP, collections, exceptions, file I/O, generics basics
- Output: small CLI programs and a beginner capstone
- Folder: `01_beginner/`

### Phase 2: Intermediate / Junior

- Duration: 6 weeks, 30 sessions
- Focus: Maven, modern Java, testing, debugging, SQL, JDBC/JPA, Spring Boot REST
- Output: Maven projects, tested code, and a junior-level REST API capstone
- Folder: `02_intermediate_junior/`

### Phase 3: Pro / Advanced

- Duration: 6 weeks, 30 sessions
- Focus: architecture hardening, Spring Boot patterns, security, transactions, observability, Docker, CI, release flow
- Output: stronger backend projects and a more complete capstone ready for portfolio/demo use
- Folder: `03_pro_advanced/`

## Repository Structure

```text
.
|-- 01_beginner/
|-- 02_intermediate_junior/
|-- 03_pro_advanced/
|-- notes/
|-- docs/
|-- templates/
|-- resources/
|-- assets/
`-- .github/
```

### Top-Level Folders

- `01_beginner/`: core Java practice by topic and beginner capstone work
- `02_intermediate_junior/`: Maven, testing, database, Spring Boot, and intermediate capstone work
- `03_pro_advanced/`: hardening, security, Docker, CI/CD, observability, and advanced capstone work
- `notes/`: weekly learning notes for each phase
- `docs/`: overview, structure notes, setup checklist, roadmap summaries, progress tracking, and note templates
- `templates/`: starter skeletons for CLI apps, Maven apps, and Spring Boot APIs
- `resources/`: quick-reference materials such as links, glossary, and interview topic notes
- `assets/`: screenshots, demos, diagrams, Postman collections, and visual study artifacts
- `.github/workflows/`: future CI workflow files

## Phase Breakdown

### `01_beginner/`

- `01_setup_basics/`
- `02_oop/`
- `03_collections_exceptions/`
- `04_io_generics/`
- `05_beginner_capstone/`

### `02_intermediate_junior/`

- `01_maven_project_structure/`
- `02_modern_java_streams/`
- `03_testing_debugging/`
- `04_sql_jdbc_or_jpa/`
- `05_spring_boot_rest/`
- `06_intermediate_capstone/`

### `03_pro_advanced/`

- `01_architecture_hardening/`
- `02_spring_boot_patterns/`
- `03_security_testing/`
- `04_data_transactions_observability/`
- `05_docker_ci_release/`
- `06_pro_capstone/`

## How To Use This Repo

1. Start from the phase that matches your current level.
2. Work inside one topic folder at a time.
3. Put code in the corresponding `src/`, `app/`, `db/`, or `docker/` subfolders.
4. Write session notes in `notes/` and local topic notes in each module folder.
5. Use `templates/` when you want to bootstrap a new practice project quickly.
6. Commit at the end of each learning session with a small, meaningful message.

## Recommended Study Workflow

1. Read the current topic goal before starting a session.
2. Open only the folder for the current week or topic.
3. Code the example yourself instead of only reading.
4. Refactor lightly after it runs.
5. Write a short note about what you understood, what broke, and what to revisit.
6. Save progress with Git after every session.

## Suggested Tooling

- JDK 21 LTS recommended
- VS Code with Extension Pack for Java
- Git
- Maven
- Postman or Bruno
- MySQL, PostgreSQL, or H2 depending on the exercise
- Docker Desktop for later phases

## Current Status

This repository is currently scaffolded only.

- Folder structure is ready.
- Placeholder files are already created.
- Most files intentionally start empty so the learning journey can be filled in progressively.

## Study Support Files

- Progress tracker: `docs/progress.md`
- Session note template: `docs/note-template.md`
- Beginner roadmap summary: `docs/roadmap/beginner.md`
- Beginner week notes: `notes/beginner/`


## What Will Be Added Over Time

- actual Java exercises and mini projects
- Maven project configuration
- Spring Boot REST API implementations
- SQL schema and seed files
- Docker and CI/CD setup
- session notes, diagrams, and demo materials

## Repository Principles

- Learn fundamentals before abstraction.
- Keep each phase separate and easy to navigate.
- Prefer small, incremental progress over overloaded sessions.
- Store both code and learning notes in the same place.
- Treat capstones as proof of progress, not side projects.

## Next Good Steps

- fill the roadmap files under `docs/roadmap/`
- add a practical `.gitignore`
- prepare starter `pom.xml` templates
- write setup instructions in `docs/setup-checklist.md`
- define the first beginner exercises in `01_beginner/01_setup_basics/`
