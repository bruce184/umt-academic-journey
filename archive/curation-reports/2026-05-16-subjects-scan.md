# 1.SUBJECTS Curated Source Scan - 2026-05-16

Source folder scanned: `D:/1.UMT/1.SUBJECTS`

## Rule Used

This update follows the curated source rule: upload meaningful source code, project files, notes, schemas, migrations, request examples, and README-style learning evidence. Do not upload dependency folders, environment files, runtime databases, generated build output, IDE state, installers, raw lecture documents, or third-party course repositories.

## Added Or Expanded

| Area | Repo destination | Notes |
| --- | --- | --- |
| Freshman DSA | `year-1-2023-2024/s03-sum24/subjects/data-structures-and-algorithms` | Added available source code only. |
| Semester 5 networking | `year-2-2024-2025/s05-spr25/subjects/computer-clouds-and-networks` | Added socket client/server project and exercise code. |
| Semester 5 OOP | `year-2-2024-2025/s05-spr25/subjects/object-oriented-programming` | Added C++/C# lab and project source. |
| Semester 5 database | `year-2-2024-2025/s05-spr25/subjects/introduction-to-database` | Added ASP.NET/database practice source without vendor libs or build output. |
| Semester 6 OS | `year-2-2024-2025/s06-sum25/subjects/intro-to-operating-systems/labs/mr-tien` | Added shell/C/C++ lab source. |
| Semester 6 Software Engineering | `year-2-2024-2025/s06-sum25/subjects/intro-to-software-engineering` | Added MR_VAN labs and implementation source copy. |
| Semester 6 AI/local math work | `year-2-2024-2025/s06-sum25/subjects/intro-to-ai/local-work` and `intro-to-mathematical-analysis/practice-code` | Added local work only; excluded Microsoft AI course repository. |
| Semester 7 Mobile/DB/Web/OCMS | `year-3-2025-2026/s07-fall25` | Added Mobile 1 labs, extra DB/Web local labs, self-learning projects, and OCMS source subset. |
| Semester 8 WAP/Outstagram/Advanced DB | `year-3-2025-2026/s08-spr26` | Added local Web Application Programming work and Outstagram source subset. |
| Semester 9 learning tracks | `year-3-2025-2026/s09-sum26/subjects/mobile-3/learning-tracks/flutter` and `subjects/web-3/learning-tracks/java-backend` | Added curated notes/source/templates; excluded generated platform/build folders. |

## Explicitly Excluded

- `node_modules/`
- `.env` and local secret files
- virtual environments and package caches
- Android Studio data/installation folders
- Java installation folders
- `.git/`, `.idea/`, `.vscode/`, `.gradle/`, `.dart_tool/`
- build outputs such as `bin/`, `obj/`, `build/`, `dist/`, `target/`
- installers, archives, binaries, runtime DB files
- raw PDF/PPTX/DOCX/XLSX course material
- third-party learning repositories or starter bundles copied locally

## Safety Pass

- Replaced demo credential strings such as sample passwords with placeholders before publishing.
- Re-scanned curated additions for obvious secret patterns and disallowed heavy artifacts.

## Follow-Up

Future updates can make this cleaner by replacing broad local-work folders with hand-written per-lab READMEs and smaller topic-level summaries as each subject is revisited.