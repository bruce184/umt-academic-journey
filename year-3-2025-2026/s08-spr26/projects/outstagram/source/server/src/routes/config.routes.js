import { Router } from "express";
import { SystemConfigService } from "../services/system-config.service.js";

const router = Router();

router.get("/public", async (req, res, next) => {
    try {
        const configs = await SystemConfigService.getPublicConfig();
        res.json({
            message: "Public config fetched successfully",
            data: { configs },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
