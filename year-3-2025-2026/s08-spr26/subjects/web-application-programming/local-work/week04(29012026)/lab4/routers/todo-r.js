import express from 'express';
import { protect } from '../middlewares/auth-mw.js';
import { validate } from '../middlewares/validate-mw.js';
import * as todoController from '../controllers/todo-c.js';
import { todoSchemas } from '../utils/schemas.js';

const router = express.Router();

// Public route to check health 
/** 
 * @openapi
 * /todos/health:
 *   get:
 *     summary: Check if the Todo API is running
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Todo API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
*/

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     summary: Lấy chi tiết một todo theo ID
 *     description: Trả về chi tiết công việc dựa trên ID được cung cấp.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Todo"
 *       400:
 *         description: Invalid path parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

router.get('/health', (req, res) => {
  return res.ok({ status: "Todo router is healthy!"});
});

router.use(protect);

/**
 * @openapi
 * /todos:
 *   post:
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     summary: Tạo mới một công việc
 *     description: Tạo mới một công việc với thông tin được cung cấp.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Create todo successfully
 *                 data:
 *                   $ref: "#/components/schemas/Todo"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post(
  '/',
  validate(todoSchemas.create, 'body'),
  todoController.createTodo
);

/**
 * @openapi
 * /todos:
 *   get:
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     summary: Lấy danh sách công việc
 *     description: Trả về danh sách công việc của người dùng hiện tại.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Todo"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  '/',
  validate(todoSchemas.query, 'query'),
  todoController.listTodos
);

router.get(
  '/:id',
  validate(todoSchemas.paramsId, 'params'),
  todoController.getTodo
);

/**
 * @openapi
 * /todos/{id}:
 *   patch:
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     summary: Cập nhật công việc
 *     description: Cập nhật thông tin công việc dựa trên ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, DONE]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Todo"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  '/:id',
  validate(todoSchemas.paramsId, 'params'),
  validate(todoSchemas.update, 'body'),
  todoController.updateTodo
);

/**
 * @openapi
 * /todos/{id}:
 *   delete:
 *     tags: [Todos]
 *     security:
 *       - BearerAuth: []
 *     summary: Xóa công việc
 *     description: Xóa công việc khỏi hệ thống dựa trên ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delete todo successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.delete(
  '/:id',
  validate(todoSchemas.paramsId, 'params'),
  todoController.deleteTodo
);

export default router;
