# Repository Structure

## Top Level

```text
.
|-- 01_beginner/
|-- 02_intermediate_junior/
|-- 03_pro_advanced/
|-- notes/
|-- docs/
|-- templates/
|-- resources/
`-- assets/
```

## Phase Folders

Each phase contains topic-based modules.

- `01_beginner/`
  Core Java fundamentals and the beginner CLI capstone.
- `02_intermediate_junior/`
  Maven-based practice, testing, SQL, Spring Boot, and the intermediate capstone.
- `03_pro_advanced/`
  Harder backend topics such as architecture, security, observability, Docker, and release workflow.

## Typical Module Layout

```text
topic-folder/
|-- src/
|-- exercises/
|-- mini-project/
`-- notes.md
```

Capstone folders may also include:

```text
|-- docs/
|-- data/
`-- src/
```

## Shared Support Folders

- `notes/`
  Weekly summaries by phase.
- `docs/`
  Roadmaps, setup guidance, templates, and progress tracking.
- `templates/`
  Starter skeletons for future Java, Maven, or Spring Boot work.
- `resources/`
  Supporting links, glossary items, and interview-topic notes.
- `assets/`
  Screenshots, demo captures, diagrams, Postman collections, and visual study evidence.

## Working Rule

Keep code inside the matching phase and topic folder. Do not mix beginner practice into later-phase folders.
