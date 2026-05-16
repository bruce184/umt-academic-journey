# LAB3 - RESTful API with Express & Postgres (Knex)

## Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

## Setup
1. **Start Database**
   ```bash
   docker compose up -d
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Migrations**
   ```bash
   npm run migrate
   ```

4. **Start Server**
   ```bash
   npm start
   # or for dev
   npm run dev
   ```

## API Documentation
The server runs on `http://localhost:3000`.

### Auth
- `POST /api/v1/users/signup` - Body: `{ name, email, password }`
- `POST /api/v1/users/login` - Body: `{ email, password }` -> Returns `{ user, token }`

### Todos (Protected)
> Headers: `Authorization: Bearer <token>`

- `GET /api/v1/todos` - List todos (params: page, limit, status, sort, q, fields)
- `POST /api/v1/todos` - Create todo (Body: `{ title, description?, status? }`)
- `GET /api/v1/todos/:id` - Get detail
- `PATCH /api/v1/todos/:id` - Update
- `DELETE /api/v1/todos/:id` - Delete

## Testing
Run the provided verification script (needs PowerShell):
```powershell
./verify.ps1
```
