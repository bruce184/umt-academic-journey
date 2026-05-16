/** songController.js: for handling song-related API requests */
import { Song } from "../models/songModel.js";
import { Playlist } from "../models/playlistModel.js";
import { PlaylistSong } from "../models/playlistSongModel.js";

// Create a new song
export const createSong = async (req, res) => {
    try {
        const { title, artist, duration_seconds, genre, audio_url } = req.body;
        const newSong = await Song.create({ title, artist, duration_seconds, genre, audio_url });
        res.status(201).json(newSong);
    } catch (error) {
        res.status(500).json({ error: "Failed to create song", details: error.message });
    }
}

// Get all songs
export const getAllSongs = async (req, res) => {
    try {
        const songs = await Song.findAll();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve songs", details: error.message });
    }
}

// Get a song by ID
export const getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findByPk(id);
        if (song) {
            res.status(200).json(song);
        } else {
            res.status(404).json({ error: "Song not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve song", details: error.message });
    }
}

// Update a song by ID
export const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artist, duration_seconds, genre, audio_url } = req.body;
        const [updated] = await Song.update(
            { title, artist, duration_seconds, genre, audio_url },
            { where: { id } }
        );
    }catch (error) {
        res.status(500).json({ error: "Failed to update song", details: error.message });
    }
}

// Delete a song by ID
export const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Song.destroy({ where: { id } });
        if (deleted) {
            res.status(200).json({ message: "Song deleted successfully" });
        } else {
            res.status(404).json({ error: "Song not found" });
        }   
    }catch (error) {   
        res.status(500).json({ error: "Failed to delete song", details: error.message });   
    }
}
