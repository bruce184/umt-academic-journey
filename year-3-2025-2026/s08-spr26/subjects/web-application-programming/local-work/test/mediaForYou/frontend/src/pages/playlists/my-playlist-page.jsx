// Đây là trang hiển thị playlist của user hiện tại, với URL /my-playlist --- IGNORE ---
// Trang này sẽ hiển thị danh sách các playlist của user, mỗi playlist có thể click vào để xem chi tiết (đường dẫn /playlists/:id) --- IGNORE ---
// Trang này cũng có thể có các chức năng như tạo mới playlist, chỉnh sửa hoặc xóa playlist (tùy vào yêu cầu của đề bài) --- IGNORE --- 

import React from "react";
export default function MyPlaylistPage() {
    return (
        <div className="my-playlist-page">
            <h1>My Playlist Page</h1>
            <p>This page will display a list of playlists created by the current user, with options to view details, create, edit, or delete playlists.</p>
        </div>
    );
}