// Đây là trang hiển thị các playlist, với URL /playlists --- IGNORE ---
// Trang này sẽ hiển thị danh sách các playlist, mỗi playlist có thể click vào để xem chi tiết (đường dẫn /playlists/:id) --- IGNORE ---
// Trang này cũng có thể có các chức năng như tạo mới playlist, chỉnh sửa hoặc xóa playlist (tùy vào yêu cầu của đề bài) --- IGNORE ---

import React from "react";
export default function PlaylistPage() {
    return (
        <div className="playlist-page">
            <h1>Playlist Page</h1>
            <p>This page will display a list of playlists with options to view details, create, edit, or delete playlists.</p>
        </div>
    );
}