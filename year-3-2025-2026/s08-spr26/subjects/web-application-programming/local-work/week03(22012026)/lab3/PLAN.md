# PLAN — Rebuild LAB2 (baseline) → Extend LAB3 (RESTful API p2)

> Audience: AI Agent (autonomous dev)  
> Goal: Implement LAB2 exactly as guideline images, then extend to LAB3.  
> Stack: Node.js (ESM), Express, Postgres (Docker), Knex, JWT, bcryptjs, Zod (LAB3).

---

## 0) Guardrails (Must Follow)
1. **LAB2 must match guideline images**: file names, folder structure, middleware wiring, response format, server startup flow.
2. **Do NOT invent additional architecture** (repo pattern, ORM, TS, etc.) unless explicitly required.
3. **IDs** for users/todos in LAB2 schema are **integer auto-increment** (Knex `increments`), not UUID.
4. **Response format** must be standardized:
   - Success: `{ data, meta: { timestamp, ... }, error: null }`
   - Error: `{ data: null, meta: { timestamp }, error: { code, message, details } }`
5. **server.js** must test DB connection before listening: `await db.raw("SELECT 1+1 AS result")`.
6. After LAB2 baseline passes, then implement LAB3 features on top (CRUD todos + list enhancements + validation).

---

## 1) Project Structure (Create/Align)
Root files:
- `app.js`, `server.js`, `docker-compose.yml`, `knexfile.js`, `.env`, `package.json`

Folders:
- `routers/`, `controllers/`, `services/`, `models/`, `middlewares/`, `utils/`, `db/`

Expected tree:
```
<root>/
  app.js
  server.js
  package.json
  docker-compose.yml
  knexfile.js
  .env

  db/
    db.js
    migrations/
    seeds/

  utils/
    response.js
    app-error.js

  middlewares/
    response-mw.js
    error-mw.js
    auth-mw.js
    validate-mw.js            # LAB3 only

  models/
    user.js
    todo.js                  # LAB3 only

  services/
    user-s.js
    todo-s.js                # LAB3 only

  controllers/
    user-c.js
    todo-c.js                # LAB3 only

  routers/
    user-r.js
    todo-r.js
```

---

## 2) Phase A — LAB2 Baseline (Exact Guideline)

### A1) Docker Postgres (Mandatory)
Create `docker-compose.yml` at root:
- image: `postgres:15-alpine`
- env:
  - POSTGRES_USER=suser
  - POSTGRES_PASSWORD="123456"
  - POSTGRES_DB=mydb
- ports: `"54232:5432"`
- volume: `db_data:/var/lib/postgresql/data`
- healthcheck: `pg_isready -U suser -d mydb`

Commands:
- Start DB: `docker compose up -d db`
- Stop: `docker compose stop db`
- Start: `docker compose start db`
- Remove + data: `docker compose down -v`

### A2) package.json (ESM + scripts)
- `"type":"module"`
- dependencies: `express cors dotenv bcryptjs jsonwebtoken knex pg`
- scripts:
  - `"start": "node server.js"`
  - `"migrate": "knex migrate:latest"`
  - `"rollback": "knex migrate:rollback"`
  - `"seed": "knex seed:run"`

Install:
- `npm i`

### A3) .env (Mandatory)
```
PORT=3000
DB_HOST=localhost
DB_PORT=54232
DB_USER=suser
DB_PASSWORD=123456
DB_NAME=mydb
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=1d
```

### A4) knexfile.js + db/db.js
- `knexfile.js` uses `dotenv/config`, client `pg`, connection from env
- migrations directory `./db/migrations`
- seeds directory `./db/seeds`

`db/db.js`:
- create knex instance
- export default db

### A5) Migration initial-db (users + todos)
Create migration: `npx knex migrate:make initial-db`

Schema (exact guideline spirit):
- `users`:
  - id increments primary
  - name string not null
  - email string not null unique
  - password string not null
  - created_at timestamp default now()
- `todos`:
  - id increments primary
  - user_id integer unsigned not null references users(id) onDelete CASCADE
  - title string not null
  - description text nullable
  - status enum PENDING|DONE default PENDING
  - created_at timestamp default now()
  - updated_at timestamp default now()

Run:
- `npm run migrate`

### A6) Standardized Response (utils + response-mw)
Create `utils/response.js`:
- `successResponse(res, data, statusCode=200, meta={})`
- `errorResponse(res, error, statusCode=500)`

Create `middlewares/response-mw.js`:
- attach helpers:
  - `res.ok(data, meta)`
  - `res.created(data, meta)`
  - `res.noContent()`
  - `res.list(items, meta)`
  - `res.error(error, statusCode=500)` → `next(AppError)`

### A7) Error Handling (AppError + error-mw)
Create `utils/app-error.js`:
- `class AppError extends Error { statusCode, details, isOperational=true }`

Create `middlewares/error-mw.js`:
- log error to console
- return standardized `errorResponse`

### A8) app.js wiring (Exact)
- `app.use(cors())`
- `app.use(express.json())`
- `app.use(responseMW())`
- mount:
  - `/api/v1/users` → userRouter
  - `/api/v1/todos` → todoRouter
- 404 handler uses `res.error({ message: ... }, 404)`
- global error handler `app.use(errorMW)`
- export default app

### A9) server.js (Exact)
- import `dotenv/config`
- import `app`
- import `db` from `./db/db.js`
- `await db.raw('SELECT 1+1 AS result')` then `app.listen(PORT)`

### A10) User APIs (Model → Service → Controller → Router)
Create `models/user.js`:
- all()
- findById(id)
- findByEmail(email)
- create(userData) returning *

Create `services/user-s.js`:
- `signup(userData)`:
  - check existing email → throw AppError(400)
  - delete passwordConfirm
  - hash password (bcrypt 12 rounds)
  - create user
  - sign JWT (payload {id})
  - delete password from user object
  - return `{ user, token }`
- `login(email,password)`:
  - find user; if fail → 401
  - compare password; if fail → 401
  - sign JWT; delete password; return `{ user, token }`

Create `controllers/user-c.js`:
- signup: `res.created({ user, token })`
- login: `res.ok({ user, token })`
- catch errors: `res.error(error)`

Create `routers/user-r.js`:
- `POST /signup`
- `POST /login`

### A11) Protect Todos (LAB2 stub)
Create `middlewares/auth-mw.js`:
- read Authorization Bearer token
- verify token
- find user by decoded.id
- attach `req.user`
- errors: AppError(401)

Create `routers/todo-r.js` (LAB2 stub):
- `router.use(protect)`
- `router.get('/:id', ...)` returns `"This is a protected TODO route."` via `res.ok`

---

## 3) Phase A — Definition of Done (Self-Verification)
Run commands:
1. `docker compose up -d db`
2. `npm i`
3. `npm run migrate`
4. `npm start`

API tests:
- GET `http://localhost:3000/api/v1` → success response format ok
- POST `/api/v1/users/signup`:
  - returns 201 + `{ user, token }` (no password)
- POST `/api/v1/users/login`:
  - returns 200 + `{ user, token }`
- GET `/api/v1/todos/1` WITHOUT token → 401 error response format
- GET `/api/v1/todos/1` WITH token → 200 `{ message }`

If all pass → Phase A complete.

---

## 4) Phase B — LAB3 Extensions (Build real Todos APIs)

### B1) Add Validation (Zod)
Install: `npm i zod`

Create `middlewares/validate-mw.js`:
- `validate(schema, source='body'|'query'|'params')`
- on fail → `AppError("Validation failed", 400, details[])`

Create schemas in router or `utils/schemas.js` (optional):
- params: `{ id: number int positive }` (use `z.coerce.number().int().positive()`)
- create todo:
  - title required (1..120)
  - description optional (<=2000)
  - status optional enum PENDING|DONE
- patch todo:
  - at least one field provided
- list query:
  - page default 1
  - limit default 20 max 100
  - status optional
  - sort optional (string)
  - q optional (<=100)
  - fields optional

### B2) Implement Todo MVC (CRUD)
Create `models/todo.js`:
- findOwnedById(userId, id)
- create(todoData)
- updateOwnedById(userId, id, patch)
- deleteOwnedById(userId, id)
- baseOwnedQuery(userId)

Create `services/todo-s.js`:
- createTodo(userId, data)
- getTodo(userId, id)
- updateTodo(userId, id, patch)
- deleteTodo(userId, id)
- listTodos(userId, query) with:
  - pagination: page, limit, offset
  - filtering: status
  - searching: q in title/description (case-insensitive)
  - sorting: `sort=-created_at,title` with whitelist
  - field selection: `fields=id,title,status` with whitelist
  - meta: `{ page, limit, total, totalPages, count }`
  - do not expose `user_id`

Create `controllers/todo-c.js`:
- create → 201
- list → 200 list with meta
- detail → 200
- patch → 200
- remove → 204

Update `routers/todo-r.js`:
- `router.use(protect)`
- `POST /` create (validate body)
- `GET /` list (validate query)
- `GET /:id` detail (validate params)
- `PATCH /:id` update (validate params+body)
- `DELETE /:id` delete (validate params)

### B3) Phase B — Definition of Done (Self-Verification)
Using token from login:
- POST `/api/v1/todos` create 2–3 todos
- GET `/api/v1/todos?page=1&limit=2` returns meta with total/totalPages
- GET `/api/v1/todos?status=PENDING`
- PATCH `/api/v1/todos/:id` status DONE
- Search: `?q=demo`
- Sort: `?sort=-created_at`
- Fields: `?fields=id,title,status`
- Ensure response format always standardized.

---

## 5) Optional Polish (Only if time)
- Add seed file under `db/seeds/` to create a demo user + todos for quick test.
- Improve CORS: allow only localhost origin (if required by rubric).
- Add basic access log (method/path/status/duration) without logging sensitive info.

---

## 6) Deliverables
- Source code passes Phase A + Phase B tests
- Includes:
  - `docker-compose.yml`
  - `.env.example` (optional)
  - migrations in `db/migrations`
  - all required MVC files
- Short README section:
  - start DB
  - migrate
  - run server
  - Postman steps to test

END.
