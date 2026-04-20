/** playlistSongController.js: for handling playlist-song-related API requests */
import { PlaylistSong } from "../models/playlistSongModel.js";

// Add a song to a playlist
export const addSongToPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const songId = req.body.song_id || req.body.songId;
        const playlistSong = await PlaylistSong.create({ playlist_id: playlistId, song_id: songId });
        res.status(201).json(playlistSong);
    } catch (error) {
        res.status(500).json({ error: "Failed to add song to playlist", details: error.message });
    }
};

// Get all songs in a specific playlist
export const getPlaylistSongs = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        // The PlaylistSong model should provide a method to fetch songs by playlist.
        // For now we attempt a generic findAll with a where clause; the model may need to implement this.
        const playlistSongs = await PlaylistSong.findAll({ where: { playlist_id: playlistId } });
        res.status(200).json(playlistSongs);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve songs in playlist", details: error.message });
    }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const songId = req.params.songId || req.body.song_id || req.body.songId;
        await PlaylistSong.destroy({ where: { playlist_id: playlistId, song_id: songId } });
        res.status(200).json({ message: "Song removed from playlist successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove song from playlist", details: error.message });
    }
};