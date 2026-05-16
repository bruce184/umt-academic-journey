# **Hướng dẫn xây dựng RESTful API** **Website (Todo App)**

# **1\. Mục Tiêu**

1. Dựng được server Express theo mô hình MVC: (routes/controllers/services/models/middlewares).  
2. Thiết kế và triển khai RESTful API cho 2 domain tối thiểu: Auth (users) và Todos.  
3. Kết nối DB bằng Supabase (PostgreSQL) \+ Knex, có migrations/seeds.  
4. Áp dụng chuẩn thực chiến:  
* JWT auth \+ (ownership check).  
* Validation (body/query/params).  
* Pagination \+ filtering (và sort/search nếu có).  
* Chuẩn hóa response \+ error (format thống nhất).  
* Logging/monitoring cơ bản (requestId \+ access log).  
* (Nếu yêu cầu) Swagger/OpenAPI docs.

---

# **2\. Yêu Cầu**

## **2.1. Yêu cầu chạy được (Run/Deploy-ready)**

* Chạy được local bằng 1 lệnh (ví dụ: npm run dev) và không crash.  
* Có file .env và load bằng dotenv (không commit secrets).  
* Kết nối được Supabase Postgres qua DATABASE\_URL (bật SSL trong knex).  
* Có script migrate/seed để tạo schema và dữ liệu mẫu nhanh.

## **2.2. Cấu trúc thư mục & kiến trúc (bắt buộc)**

* Có cấu trúc thư mục rõ ràng (tối thiểu: routes/ controllers/ services/ models/ middlewares/ utils/ db/).  
* Không viết query DB trong routes; controller mỏng, logic chính nằm ở service.  
* Có 404 handler và error middleware (tập trung, format thống nhất).  
* Không để lộ password, token, secret trong response/logs.

**2.3. Database & dữ liệu (bắt buộc)**

* Dùng Supabase PostgreSQL; có migrations tạo tối thiểu 2 bảng users và todos.  
* users: id, name, email(unique), password\_hash, created\_at.  
* todos: id, user\_id(FK), title(required), description(optional), status(PENDING/DONE), due\_date(optional), created\_at, updated\_at.  
* Có seeds tạo ít nhất 1 user \+ vài todos để test list/filter/pagination.

**2.4. API endpoints tối thiểu (bắt buộc)**

Base URL: /api/v1

**2.4.1. Auth**

* POST /users/signup \-\> 201  
* POST /users/login \-\> 200  
* Password phải hash (bcrypt) trước khi lưu.  
* JWT gửi qua header: Authorization: Bearer \<token\>

**2.4.2. Todos (yêu cầu JWT)**

* POST /todos (tạo)  
* GET /todos (list) có page, limit (pagination) và status (filter PENDING/DONE).  
* GET /todos/:id (detail)  
* PATCH /todos/:id (update partial)  
* DELETE /todos/:id (delete)

**2.5. Authorization (ownership check)**

* Chỉ được sửa/xóa todo của chính mình.  
* Thiếu token / token sai \-\> 401\.

Không đủ quyền (owner-check): trả 404 (che dấu resource tồn tại, phải nhất quán toàn hệ thống).

**2.6. Validation (bắt buộc)**

* Validate body cho signup/login và create/patch todo (required, kiểu dữ liệu, enum).  
* Validate query cho GET /todos: page \>= 1, limit trong khoảng hợp lệ, status thuộc enum.  
* Validate params cho :id (int/uuid tùy schema); không hợp lệ \-\> 422 (hoặc 400, chọn 1 và dùng nhất quán).

**2.7. Pagination \+ Filtering \+ Meta (bắt buộc)**

* GET /todos hỗ trợ pagination: page, limit (mặc định page=1, limit=20; giới hạn max 100).  
* Filter tối thiểu: status=PENDING|DONE.  
* Response list có meta: page, limit, totalItems, totalPages.

**2.8. Chuẩn hóa response & error (bắt buộc)**

* Success: thống nhất format { data, meta, error:null } hoặc tối thiểu { data, meta }.  
* Error: thống nhất format { data:null, meta, error:{ code, message, details } }.  
* Có requestId (header x-request-id) để trace lỗi (khuyến nghị).

**2.9. Logging & Docs (bắt buộc theo rubric/lab)**

* Có access log (method, path, status, duration) và không log secrets.  
* Có app log cho các sự kiện chính (login success/fail, todo created/updated/deleted).  
* Nếu yêu cầu tuần 4: có /docs (Swagger UI) và /openapi.json (hoặc /openapi.yaml).

**2.10. Checklist DoD trước khi nộp**

* npm run dev chạy OK.  
* npm run migrate \+ npm run seed chạy OK (Supabase DB).  
* Signup/Login OK, trả token OK.

Todo CRUD OK, owner-check đúng (404 theo policy).

* List có page/limit/status và trả meta đúng.  
* Validation hoạt động (body/query/params), trả lỗi có details.  
* 404 handler \+ centralized error handler hoạt động.  
* Logging có requestId và không lộ secrets.  
* (Nếu yêu cầu) /docs hiển thị và openapi spec có BearerAuth.

# ---

# **3\. Hướng dẫn**

## **3.1. Chuẩn bị**

### **3.1.1. Tạo project Node \+ Thiết lập cấu hình chạy**

Lệnh:

mkdir midterm-api  
cd midterm-api  
npm init \-y

Dev tool (auto reload)

Lệnh:

npm i \-D nodemon

Sửa package.json (tối thiểu)

{  
  "type": "module",  
  "scripts": {  
    "dev": "nodemon src/server.js",  
    "start": "node src/server.js",  
    "migrate": "knex migrate:latest",  
    "rollback": "knex migrate:rollback",  
    "seed": "knex seed:run"  
  }  
}

### **3.1.2. Cài package theo nhóm chức năng**

| Thành phần | Lệnh cài thư viện |
| ----- | ----- |
| Express core | npm i express |
| Load biến môi trường | npm i dotenv |
| CORS (nếu gọi API từ origin khác) | npm i cors |
| DB Supabase Postgres qua Knex | npm i knex pg |
| JWT Authentication | npm i jsonwebtoken |
| Hash password | npm i bcryptjs |
| Validation body/query/params (khuyến nghị) | npm i zod |
| Logging request (access log) | npm i morgan |
| Swagger/OpenAPI (tuần 4 / nếu đề yêu cầu) | npm i swagger-ui-express swagger-jsdoc |
| Dev auto reload | npm i \-D nodemon |
| (Tuỳ chọn) HTTPS local bằng mkcert | npm i \-g mkcert |

### **3.1.3. Tạo .env (Supabase DB)**

Tạo file .env ở root:

PORT=3000  
NODE\_ENV=development

\# Supabase Postgres: dùng connection string từ Supabase Dashboard  
DATABASE\_URL=postgresql://USER:PASSWORD@HOST:5432/postgres

JWT\_SECRET=supersecretkey123  
JWT\_EXPIRES\_IN=1d

\# nếu dùng swagger server url  
BASE\_URL=http://localhost:3000/api/v1

\# nếu làm HTTPS (tuỳ chọn)  
HTTPS\_PORT=3443  
SSL\_KEY\_PATH=./certs/localhost-key.pem  
SSL\_CERT\_PATH=./certs/localhost-cert.pem

ENABLE\_DOCS=false

Ghi chú Supabase: vào Supabase \-\> Project Settings \-\> Database \-\> Connection string (copy dạng URI).

Quan trọng: Supabase thường cần SSL \=\> trong Knex config sẽ bật ssl.

## **3.2. Tạo cây thư mục (MVC mở rộng)**

src/  
  app.js  
  server.js  
  routes/  
    index.js  
    user-r.js  
    todo-r.js  
  controllers/  
    userController.js  
    todoController.js  
  services/  
    userService.js  
    todoService.js  
  models/  
    userModel.js  
    todoModel.js  
  middlewares/  
    auth.js  
    validate.js  
    response-mw.js  
    error-mw.js  
    request-id.js  
  utils/  
    response.js  
    app-error.js  
  db/  
    db.js  
  docs/  
    swagger.js

db/  
  migrations/  
  seeds/

knexfile.js  
.env

## **3.3. Kết nối Supabase bằng Knex**

### **3.3.1. Khởi tạo Knex config**

Lệnh tạo config (nếu cần):

npx knex init

Tạo/sửa knexfile.js (ESM \+ Supabase SSL):

import "dotenv/config";

export default {  
  development: {  
    client: "pg",  
    connection: {  
      connectionString: process.env.DATABASE\_URL,  
      ssl: { rejectUnauthorized: false } // Supabase thường cần SSL  
    },  
    migrations: {  
      directory: "./db/migrations",  
      tableName: "knex\_migrations"  
    },  
    seeds: {  
      directory: "./db/seeds"  
    },  
    pool: { min: 2, max: 10 }  
  }  
};

### **3.3.2. Tạo src/db/db.js**

import knex from "knex";  
import knexConfig from "../../knexfile.js";

const env \= process.env.NODE\_ENV || "development";  
const db \= knex(knexConfig\[env\]);

export default db;

## **3.4. Migrations \+ Seeds (schema chuẩn Todo \+ User)**

### **3.4.1. Tạo migration initial-db**

Lệnh:

npx knex migrate:make initial-db

Code của db/migrations/\*\_initial-db.js:

export async function up(knex) {  
  await knex.schema.createTable("users", (t) \=\> {  
    t.increments("id").primary();  
    t.string("name").notNullable();  
    t.string("email").notNullable().unique();  
    t.string("password\_hash").notNullable();  
    t.timestamp("created\_at").defaultTo(knex.fn.now());  
  });

  await knex.schema.createTable("todos", (t) \=\> {  
    t.increments("id").primary();

    t.integer("user\_id")  
      .unsigned()  
      .notNullable()  
      .references("id")  
      .inTable("users")  
      .onDelete("CASCADE");

    t.string("title").notNullable();  
    t.text("description").nullable();

    t.enu("status", \["PENDING", "DONE"\]).defaultTo("PENDING");  
    t.date("due\_date").nullable(); // theo lab3 (tùy scope)

    t.timestamp("created\_at").defaultTo(knex.fn.now());  
    t.timestamp("updated\_at").defaultTo(knex.fn.now());  
  });  
}

export async function down(knex) {  
  await knex.schema.dropTableIfExists("todos");  
  await knex.schema.dropTableIfExists("users");  
}

Chạy migrate: npm run migrate

Nếu bạn đã migrate rồi mà mới thêm due\_date: đúng best practice là tạo migration mới. Nhưng lab có thể cho rollback rồi migrate lại:

* npm run rollback  
* npm run migrate

### **3.4.2. Tạo seed data**

Lệnh:

npx knex seed:make seed-initial

Code trong db/seeds/seed-initial.js (ví dụ tối giản):

import bcrypt from "bcryptjs";

export async function seed(knex) {  
  await knex("todos").del();  
  await knex("users").del();

  const password\_hash \= await bcrypt.hash("123456", 10);

  const \[user\] \= await knex("users")  
    .insert({ name: "Demo", email: "demo@gmail.com", password\_hash })  
    .returning(\["id"\]);

  await knex("todos").insert(\[  
    { user\_id: user.id, title: "Learn Express", status: "PENDING" },  
    { user\_id: user.id, title: "Write swagger-jsdoc", status: "DONE" }  
  \]);  
}

Chạy seed: npm run seed

## **3.5. Chuẩn hóa Response \+ AppError \+ Error handling tập trung**

### **3.5.1. src/utils/app-error.js**

export default class AppError extends Error {  
  constructor({  
    message,  
    statusCode \= 500,  
    code \= "INTERNAL\_ERROR",  
    details \= null,  
    cause \= null  
  }) {  
    super(message);  
    this.name \= "AppError";  
    this.statusCode \= statusCode;  
    this.code \= code;  
    this.details \= details;  
    this.cause \= cause;  
  }  
}

### **3.5.2. src/utils/response.js**

export const successResponse \= (res, data, statusCode \= 200, meta \= {}) \=\> {  
  // 204: không được trả body  
  if (statusCode \=== 204\) return res.status(204).end();

  return res.status(statusCode).json({  
    data,  
    meta: { timestamp: new Date().toISOString(), ...meta },  
    error: null  
  });  
};

export const errorResponse \= (res, err, statusCode \= 500, meta \= {}) \=\> {  
  return res.status(statusCode).json({  
    data: null,  
    meta: { timestamp: new Date().toISOString(), ...meta },  
    error: {  
      code: err.code || "INTERNAL\_ERROR",  
      message: err.message || "Internal Server Error",  
      details: err.details || null  
    }  
  });  
};

### **3.5.3. src/middlewares/response-mw.js**

import { successResponse, errorResponse } from "../utils/response.js";

export default function responseFormatter() {  
  return (req, res, next) \=\> {  
    const metaBase \= { requestId: req.requestId };

    res.ok \= (data, meta \= {}) \=\> successResponse(res, data, 200, { ...metaBase, ...meta });  
    res.created \= (data, meta \= {}) \=\> successResponse(res, data, 201, { ...metaBase, ...meta });  
    res.noContent \= (meta \= {}) \=\> successResponse(res, null, 204, { ...metaBase, ...meta });  
    res.list \= (items, meta \= {}) \=\> successResponse(res, items, 200, { ...metaBase, ...meta });

    res.fail \= (err, statusCode \= 500\) \=\> errorResponse(res, err, statusCode, metaBase);

    next();  
  };  
}

### **3.5.4. src/middlewares/error-mw.js**

import AppError from "../utils/app-error.js";  
import { errorResponse } from "../utils/response.js";

export function notFound(req, res) {  
  const err \= new AppError({  
    statusCode: 404,  
    code: "NOT\_FOUND",  
    message: "Route not found"  
  });  
  return errorResponse(res, err, 404, { requestId: req.requestId });  
}

export function errorHandler(err, req, res, next) {  
  const statusCode \= err.statusCode || 500;

  const normalized \=  
    err instanceof AppError  
      ? err  
      : new AppError({  
          statusCode,  
          code: "INTERNAL\_ERROR",  
          message: err.message || "Internal Server Error"  
        });

  return errorResponse(res, normalized, statusCode, { requestId: req.requestId });  
}

## **3.6. Validation (body/query/params) bằng Zod**

### **3.6.1. src/middlewares/validate.js**

import AppError from "../utils/app-error.js";

export function validate(schema, source \= "body") {  
  return (req, res, next) \=\> {  
    const data \= req\[source\];

    const result \= schema.safeParse(data);  
    if (\!result.success) {  
      const details \= result.error.issues.map((i) \=\> ({  
        field: i.path.join("."),  
        message: i.message  
      }));

      return next(  
        new AppError({  
          statusCode: 422,  
          code: "VALIDATION\_ERROR",  
          message: "Invalid request",  
          details  
        })  
      );  
    }

    // replace bằng dữ liệu đã được parse/clean  
    req\[source\] \= result.data;  
    next();  
  };  
}

Gợi ý schema dùng trong routes (ví dụ):

import { z } from "zod";

export const signupSchema \= z.object({  
  name: z.string().min(1),  
  email: z.string().email(),  
  password: z.string().min(6)  
});

export const loginSchema \= z.object({  
  email: z.string().email(),  
  password: z.string().min(6)  
});

const dateRegex \= /^\\d{4}-\\d{2}-\\d{2}$/;  
export const createTodoSchema \= z.object({  
  title: z.string().min(1).transform((s) \=\> s.trim()),  
  description: z.string().optional(),  
  status: z.enum(\["PENDING", "DONE"\]).optional(),  
  due\_date: z.string().regex(dateRegex, "due\_date must be YYYY-MM-DD").optional()  
});

export const listQuerySchema \= z.object({  
  page: z.coerce.number().int().min(1).default(1),  
  limit: z.coerce.number().int().min(1).max(100).default(20),  
  status: z.enum(\["PENDING", "DONE"\]).optional()  
});

export const idParamSchema \= z.object({  
  id: z.coerce.number().int().min(1)  
});

## **3.7. Auth (signup/login JWT) \+ middleware bảo vệ**

### **3.7.1. src/models/userModel.js**

import db from "../db/db.js";

export const findByEmail \= (email) \=\> db("users").where({ email }).first();

export const createUser \= (payload) \=\>  
  db("users").insert(payload).returning(\["id", "name", "email"\]);

export const findById \= (id) \=\> db("users").where({ id }).first();

### **3.7.2. src/services/userService.js**

import bcrypt from "bcryptjs";  
import jwt from "jsonwebtoken";  
import AppError from "../utils/app-error.js";  
import { findByEmail, createUser } from "../models/userModel.js";

export async function signup({ name, email, password }) {  
  const exists \= await findByEmail(email);  
  if (exists)  
    throw new AppError({  
      statusCode: 409,  
      code: "EMAIL\_EXISTS",  
      message: "Email already exists"  
    });

  const password\_hash \= await bcrypt.hash(password, 10);  
  const \[user\] \= await createUser({ name, email, password\_hash });

  return user;  
}

export async function login({ email, password }) {  
  const user \= await findByEmail(email);  
  if (\!user)  
    throw new AppError({  
      statusCode: 401,  
      code: "INVALID\_CREDENTIALS",  
      message: "Invalid email or password"  
    });

  const ok \= await bcrypt.compare(password, user.password\_hash);  
  if (\!ok)  
    throw new AppError({  
      statusCode: 401,  
      code: "INVALID\_CREDENTIALS",  
      message: "Invalid email or password"  
    });

  const token \= jwt.sign(  
    { id: user.id, email: user.email },  
    process.env.JWT\_SECRET,  
    { expiresIn: process.env.JWT\_EXPIRES\_IN || "1d" }  
  );

  return { token };  
}

### **3.7.3. src/controllers/userController.js**

import \* as userService from "../services/userService.js";

export async function signup(req, res, next) {  
  try {  
    const user \= await userService.signup(req.body);  
    return res.created(user);  
  } catch (err) {  
    return next(err);  
  }  
}

export async function login(req, res, next) {  
  try {  
    const result \= await userService.login(req.body);  
    return res.ok(result);  
  } catch (err) {  
    return next(err);  
  }  
}

### **3.7.4. src/middlewares/auth.js**

import jwt from "jsonwebtoken";  
import AppError from "../utils/app-error.js";  
import { findById } from "../models/userModel.js";

export async function requireAuth(req, res, next) {  
  const header \= req.headers.authorization || "";  
  const \[type, token\] \= header.split(" ");

  if (type \!== "Bearer" || \!token) {  
    return next(  
      new AppError({  
        statusCode: 401,  
        code: "UNAUTHORIZED",  
        message: "Missing token"  
      })  
    );  
  }

  try {  
    const payload \= jwt.verify(token, process.env.JWT\_SECRET);  
    const user \= await findById(payload.id);

    if (\!user)  
      return next(  
        new AppError({  
          statusCode: 401,  
          code: "UNAUTHORIZED",  
          message: "User not found"  
        })  
      );

    req.user \= { id: user.id, email: user.email };  
    return next();  
  } catch {  
    return next(  
      new AppError({  
        statusCode: 401,  
        code: "UNAUTHORIZED",  
        message: "Invalid token"  
      })  
    );  
  }  
}

### **3.7.5. src/routes/user-r.js**

import { Router } from "express";  
import { validate } from "../middlewares/validate.js";  
import { signup, login } from "../controllers/userController.js";  
import { z } from "zod";

const router \= Router();

const signupSchema \= z.object({  
  name: z.string().min(1),  
  email: z.string().email(),  
  password: z.string().min(6)  
});

const loginSchema \= z.object({  
  email: z.string().email(),  
  password: z.string().min(6)  
});

router.post("/signup", validate(signupSchema, "body"), signup);  
router.post("/login", validate(loginSchema, "body"), login);

export default router;

### **3.7.6. src/routes/index.js**

import { Router } from "express";  
import userRouter from "./user-r.js";  
import todoRouter from "./todo-r.js";

const router \= Router();

router.use("/users", userRouter);  
router.use("/todos", todoRouter);

export default router;

## **3.8. Todos CRUD \+ Ownership check \+ Pagination/Filtering**

### **3.8.1. src/models/todoModel.js**

import db from "../db/db.js";

export const createTodo \= (payload) \=\>  
  db("todos")  
    .insert(payload)  
    .returning(\["id", "user\_id", "title", "description", "status", "due\_date", "created\_at", "updated\_at"\]);

export const findTodoById \= (id) \=\> db("todos").where({ id }).first();

export async function listTodos({ userId, status, limit, offset }) {  
  const base \= db("todos").where({ user\_id: userId });

  if (status) base.andWhere({ status });

  const \[countRow\] \= await base.clone().count({ total: "\*" });

  const items \= await base  
    .clone()  
    .orderBy("id", "desc")  
    .limit(limit)  
    .offset(offset);

  return { items, totalItems: Number(countRow.total) };  
}

export const updateTodo \= (id, patch) \=\>  
  db("todos")  
    .where({ id })  
    .update({ ...patch, updated\_at: db.fn.now() })  
    .returning(\["id", "user\_id", "title", "description", "status", "due\_date", "created\_at", "updated\_at"\]);

export const deleteTodo \= (id) \=\> db("todos").where({ id }).del();

### **3.8.2. src/services/todoService.js**

import AppError from "../utils/app-error.js";  
import {  
  createTodo,  
  findTodoById,  
  listTodos,  
  updateTodo,  
  deleteTodo  
} from "../models/todoModel.js";

async function mustBeOwner(todoId, userId) {  
  const todo \= await findTodoById(todoId);

  if (\!todo)  
    throw new AppError({  
      statusCode: 404,  
      code: "TODO\_NOT\_FOUND",  
      message: "Todo not found"  
    });

  if (todo.user\_id \!== userId) {  
     // policy: 404 (che dấu tồn tại)  
    throw new AppError({  
statusCode: 404,  
code: "TODO\_NOT\_FOUND",  
 message: "Todo not found"  
    });  
  }

  return todo;  
}

export async function create(userId, body) {  
  const payload \= {  
    user\_id: userId,  
    title: body.title,  
    description: body.description ?? null,  
    status: body.status ?? "PENDING",  
    due\_date: body.due\_date ?? null  
  };

  const \[todo\] \= await createTodo(payload);  
  return todo;  
}  
export async function list(userId, query) {  
  const page \= query.page ?? 1;  
  const limit \= query.limit ?? 20;  
  const offset \= (page \- 1\) \* limit;

  const { items, totalItems } \= await listTodos({  
    userId,  
    status: query.status,  
    limit,  
    offset  
  });

const totalPages \= Math.ceil(totalItems / limit); // 0 nếu totalItems \= 0

  return {  
    items,  
    meta: { page, limit, totalItems, totalPages }  
  };  
}

export async function detail(userId, todoId) {  
  const todo \= await mustBeOwner(todoId, userId);  
  return todo;  
}

export async function patch(userId, todoId, body) {  
  await mustBeOwner(todoId, userId);

  const patchData \= {};  
  if (body.title \!== undefined) patchData.title \= body.title;  
  if (body.description \!== undefined) patchData.description \= body.description;  
  if (body.status \!== undefined) patchData.status \= body.status;  
  if (body.due\_date \!== undefined) patchData.due\_date \= body.due\_date;

  const \[todo\] \= await updateTodo(todoId, patchData);  
  return todo;  
}

export async function remove(userId, todoId) {  
  await mustBeOwner(todoId, userId);  
  await deleteTodo(todoId);  
  return null;  
}

### **3.8.3. src/controllers/todoController.js**

import \* as todoService from "../services/todoService.js";

export async function create(req, res, next) {  
  try {  
    const todo \= await todoService.create(req.user.id, req.body);  
    return res.created(todo);  
  } catch (err) {  
    return next(err);  
  }  
}

export async function list(req, res, next) {  
  try {  
    const { items, meta } \= await todoService.list(req.user.id, req.query);  
    return res.list(items, meta);  
  } catch (err) {  
    return next(err);  
  }  
}

export async function detail(req, res, next) {  
  try {  
    const todo \= await todoService.detail(req.user.id, Number(req.params.id));  
    return res.ok(todo);  
  } catch (err) {  
    return next(err);  
  }  
}

export async function patch(req, res, next) {  
  try {  
    const todo \= await todoService.patch(req.user.id, Number(req.params.id), req.body);  
    return res.ok(todo);  
  } catch (err) {  
    return next(err);  
  }  
}

export async function remove(req, res, next) {  
  try {  
    await todoService.remove(req.user.id, Number(req.params.id));  
    return res.noContent();  
  } catch (err) {  
    return next(err);  
  }  
}

### **3.8.4. src/routes/todo-r.js**

import { Router } from "express";  
import { requireAuth } from "../middlewares/auth.js";  
import { validate } from "../middlewares/validate.js";  
import { create, list, detail, patch, remove } from "../controllers/todoController.js";  
import { z } from "zod";

const router \= Router();  
const dateRegex \= /^\\d{4}-\\d{2}-\\d{2}$/;

const createTodoSchema \= z.object({  
  title: z.string().min(1).transform((s) \=\> s.trim()),  
description: z.string().nullable().optional(),  
  status: z.enum(\["PENDING", "DONE"\]).optional(),  
  due\_date: z.string().regex(dateRegex, "due\_date must be YYYY-MM-DD").optional()  
});

const patchTodoSchema \= z.object({  
  title: z.string().min(1).transform((s) \=\> s.trim()).optional(),  
  description: z.string().nullable().optional(),  
  status: z.enum(\["PENDING", "DONE"\]).optional(),  
  due\_date: z.string().regex(dateRegex, "due\_date must be YYYY-MM-DD").optional()  
});

const listQuerySchema \= z.object({  
  page: z.coerce.number().int().min(1).default(1),  
  limit: z.coerce.number().int().min(1).max(100).default(20),  
  status: z.enum(\["PENDING", "DONE"\]).optional()  
});

const idParamSchema \= z.object({  
  id: z.coerce.number().int().min(1)  
});

// tất cả todos đều yêu cầu JWT  
router.use(requireAuth);

// CRUD  
router.post("/", validate(createTodoSchema, "body"), create);  
router.get("/", validate(listQuerySchema, "query"), list);  
router.get("/:id", validate(idParamSchema, "params"), detail);  
router.patch("/:id", validate(idParamSchema, "params"), validate(patchTodoSchema, "body"), patch);  
router.delete("/:id", validate(idParamSchema, "params"), remove);

export default router;

## **3.9. RequestId \+ Logging cơ bản**

### **3.9.1. src/middlewares/request-id.js**

import { randomUUID } from "crypto";

export function requestId(req, res, next) {  
  const rid \= req.headers\["x-request-id"\] || randomUUID();  
  req.requestId \= rid;  
  res.setHeader("x-request-id", rid);  
  next();  
}

### **3.9.2. Logging bằng morgan (access log)**

* Mục tiêu: log method, url, status, response-time, requestId.  
* Không log secrets: password, token, JWT\_SECRET.

Ví dụ cấu hình trong **app.js**:

import morgan from "morgan";  
// ...  
morgan.token("rid", (req) \=\> req.requestId);  
app.use(morgan(":method :url :status :response-time ms \- rid=:rid"));

### **3.9.3. App log (khuyến nghị)**

* Log các sự kiện chính: login success/fail, todo created/updated/deleted (dùng console.log là đủ cho midterm).  
* Khi log error: có thể log stack trong development, nhưng không trả stack ra response.

## **3.10. Swagger/OpenAPI (nếu yêu cầu)**

### **3.10.1. src/docs/swagger.js**

import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec \= swaggerJSDoc({  
  definition: {  
    openapi: "3.0.0",  
    info: {  
      title: "Todo API",  
      version: "1.0.0"  
    },  
    servers: \[  
      { url: process.env.BASE\_URL || "http://localhost:3000/api/v1" }  
    \],  
    components: {  
      securitySchemes: {  
        BearerAuth: {  
          type: "http",  
          scheme: "bearer",  
          bearerFormat: "JWT"  
        }  
      }  
    }  
  },  
  apis: \["./src/routes/\*.js"\] // đọc JSDoc trong routes  
});

### **3.10.2. Mount /docs và /openapi.json trong app.js**

import swaggerUi from "swagger-ui-express";  
import { swaggerSpec } from "./docs/swagger.js";

// ...  
const enableDocs \= process.env.ENABLE\_DOCS \=== "true";

if (enableDocs) {  
  app.get("/openapi.json", (req, res) \=\> res.json(swaggerSpec));  
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));  
}

Gợi ý: thêm JSDoc OpenAPI ngay trên từng route trong routes/\*.js (tuỳ thời gian).

## **3.11. Ghép tất cả lại: app.js \+ server.js**

### **3.11.1. src/app.js (middleware order chuẩn)**

import express from "express";  
import cors from "cors";  
import morgan from "morgan";  
import "dotenv/config";

import routes from "./routes/index.js";  
import responseFormatter from "./middlewares/response-mw.js";  
import { requestId } from "./middlewares/request-id.js";  
import { notFound, errorHandler } from "./middlewares/error-mw.js";

// (Nếu dùng Swagger)  
import swaggerUi from "swagger-ui-express";  
import { swaggerSpec } from "./docs/swagger.js";

const app \= express();

// 1\) core middlewares  
app.use(cors());  
app.use(express.json());

// 2\) requestId \+ logging  
app.use(requestId);

// morgan: log theo req.requestId (luôn có, do middleware requestId gắn vào)  
morgan.token("rid", (req) \=\> req.requestId);  
app.use(morgan(":method :url :status :response-time ms \- rid=:rid"));

// 3\) response helpers (res.ok/res.created/...)  
app.use(responseFormatter());

// 4\) routes  
app.use("/api/v1", routes);

// 5\) docs (nếu yêu cầu)  
app.get("/openapi.json", (req, res) \=\> res.json(swaggerSpec));  
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6\) 404 \+ error handler  
app.use(notFound);  
app.use(errorHandler);

export default app;

### **3.11.2. src/server.js (test DB \+ start)**

import "dotenv/config";  
import app from "./app.js";  
import db from "./db/db.js";

const PORT \= process.env.PORT || 3000;

async function start() {  
  // check DB connection (Supabase)  
  await db.raw("SELECT 1 as ok");  
  console.log("Database connected.");

  app.listen(PORT, () \=\> console.log(\`Server listening on port ${PORT}\`));  
}

start().catch((e) \=\> {  
  console.error("Unable to start server:", e);  
  process.exit(1);  
});

---

# **4\. Test nhanh bằng HTTPie (flow chuẩn)**

* Flow: signup \-\> login \-\> todos CRUD \-\> filtering/pagination \-\> ownership check \-\> lỗi chuẩn hoá.  
* Giả sử server chạy tại [http://localhost:3000](http://localhost:3000)

## **4.1.  Signup**

http POST :3000/api/v1/users/signup name=Bruce email=bruce@gmail.com password=123456

## **4.2.  Login (lấy token)**

http POST :3000/api/v1/users/login email=bruce@gmail.com password=123456

#### **Copy token và export (PowerShell):**

$env:TOKEN="PASTE\_TOKEN\_HERE" 

## **4.3.  Create todo**

http POST :3000/api/v1/todos "Authorization:Bearer $env:TOKEN" title="Task 1" description="demo" status="PENDING" 

## **4.4. List todos (pagination \+ filter)**

http GET :3000/api/v1/todos "Authorization:Bearer $env:TOKEN" page==1 limit==5  
http GET :3000/api/v1/todos "Authorization:Bearer $env:TOKEN" status==DONE page==1 limit==20

## **4.5 Detail / Patch / Delete**

http GET :3000/api/v1/todos/1 "Authorization:Bearer $env:TOKEN"  
http PATCH :3000/api/v1/todos/1 "Authorization:Bearer $env:TOKEN" status="DONE"  
http DELETE :3000/api/v1/todos/1 "Authorization:Bearer $env:TOKEN" 

## **4.6 Ownership check (tạo user khác rồi thử patch/delete todo không phải owner)**

* Đăng ký \+ login user2 \-\> lấy TOKEN2.  
* Dùng TOKEN2 gọi PATCH/DELETE lên todo của user1.

Kỳ vọng: 404 (che dấu tồn tại).

