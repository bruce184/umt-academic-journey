import express from 'express';
import * as userController from '../controllers/user-c.js';

import { validate } from '../middlewares/validate-mw.js';
import { userSchemas } from '../utils/schemas.js';

const router = express.Router();

router.post('/signup', validate(userSchemas.signup, 'body'), userController.signup);
router.post('/login', validate(userSchemas.login, 'body'), userController.login);

export default router;
