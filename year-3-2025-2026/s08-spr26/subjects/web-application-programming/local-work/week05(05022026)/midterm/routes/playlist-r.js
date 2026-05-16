/** playlist-routes.js: for defining playlist-related API routes */
import express from "express";
import {
    createPlaylist,
    getAllPlaylists,    
    getPlaylistById,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlistController.js";
import {} from "../controllers/playlistSongController.js";

const router = express.Router();

// Playlist routes
router.post("/playlists", createPlaylist);
router.get("/playlists", getAllPlaylists);
router.get("/playlists/:id", getPlaylistById);
router.put("/playlists/:id", updatePlaylist);
router.delete("/playlists/:id", deletePlaylist);

export default router;