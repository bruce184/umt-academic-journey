// routers/root.r.js
import { Router } from "express";
import * as rootController from '../controllers/root.c.js';

const router = Router();

router.get('/', (req, res) => res.redirect('/signup'));

// Delegate to controller functions in controllers/root.c.js
router.get('/signup', rootController.getSignup);
router.get('/simple-calculator', rootController.getCalculator);

// health check for readiness
router.get('/health', (req, res) => {
	res.json({ status: 'ok', uptime: process.uptime() });
});

export default router;
