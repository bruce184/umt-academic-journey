/** playlist-song-routes.js: for defining playlist-song-related API routes */
import express from "express";
import {
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylistSongs
} from "../controllers/playlistSongController.js";

const router = express.Router();

// Playlist-Song routes
router.post("/playlists/:playlistId/songs", addSongToPlaylist);
router.delete("/playlists/:playlistId/songs/:songId", removeSongFromPlaylist);
router.get("/playlists/:playlistId/songs", getPlaylistSongs);

export default router;