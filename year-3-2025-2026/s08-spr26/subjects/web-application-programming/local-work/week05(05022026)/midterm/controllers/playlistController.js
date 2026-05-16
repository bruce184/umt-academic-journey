/** playlistController.js: for handling playlist-related API requests */
import { Playlist } from "../models/playlistModel.js";

// Create a new playlist
export const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newPlaylist = await Playlist.create({ name, description });
        res.status(201).json(newPlaylist);
    } catch (error) {
        res.status(500).json({ error: "Failed to create playlist", details: error.message });
    }   
}

// Get all playlists
export const getAllPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.findAll();
        res.status(200).json(playlists);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve playlists", details: error.message });
    }
}

// Get a playlist by ID
export const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findByPk(id); 
        if (playlist) {
            res.status(200).json(playlist);
        } else {
            res.status(404).json({ error: "Playlist not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve playlist", details: error.message });
    }   
}

// Update a playlist by ID
export const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const [updated] = await Playlist.update(
            { name, description },
            { where: { id } }
        );  
        if (updated) {
            const updatedPlaylist = await Playlist.findByPk(id);
            res.status(200).json(updatedPlaylist);
        } else {
            res.status(404).json({ error: "Playlist not found" });
        }
    }catch (error) {
        res.status(500).json({ error: "Failed to update playlist", details: error.message });
    }
}

// Delete a playlist by ID
export const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Playlist.destroy({ where: { id } });  
        if (deleted) {
            res.status(200).json({ message: "Playlist deleted successfully" });
        } else {
            res.status(404).json({ error: "Playlist not found" });
        }
    }catch (error) {
        res.status(500).json({ error: "Failed to delete playlist", details: error.message });
    }
}
