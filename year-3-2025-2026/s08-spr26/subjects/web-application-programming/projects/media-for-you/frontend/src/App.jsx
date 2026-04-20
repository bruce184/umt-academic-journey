import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/auth/ProfilePage";
import SongPage from "./pages/songs/song-page";
import SongDetailPage from "./pages/songs/song-detail-page";
import PlaylistPage from "./pages/songs/playlist-page";
import PlaylistDetailPage from "./pages/songs/playlist-detail-page";


export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Navbar />

        <MainShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/songs" element={<TasksPage />} />
            <Route path="/songs/:id" element={<TasksPage />} />
            <Route path="/playlists" element={<TasksPage />} />
            <Route path="/playlists/:id" element={<TasksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainShell>
      </div>
    </BrowserRouter>
  );
}
