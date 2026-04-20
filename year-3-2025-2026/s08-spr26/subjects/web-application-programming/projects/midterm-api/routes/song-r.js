/** song-routes.js: for defining song-related API routes */
import express from "express";
import {
    createSong,
    getAllSongs,
    getSongById,
    updateSong,
    deleteSong
} from "../controllers/songController.js";
const router = express.Router();

// Song routes
router.post("/songs", createSong);
router.get("/songs", getAllSongs);
router.get("/songs/:id", getSongById);
router.put("/songs/:id", updateSong);
router.delete("/songs/:id", deleteSong);

export default router;