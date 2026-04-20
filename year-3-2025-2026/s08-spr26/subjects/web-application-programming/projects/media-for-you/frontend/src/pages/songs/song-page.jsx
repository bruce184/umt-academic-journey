// Đây là trang hiển thị tất cả các bài hát với thông tin tổng quan, có thể truy cập từ đường dẫn /songs --- IGNORE ---
// Trang này sẽ hiển thị danh sách bài hát, mỗi bài hát có thể click vào để xem chi tiết (đường dẫn /songs/:id) --- IGNORE ---
// Trang này cũng có thể có các chức năng như tạo mới bài hát, chỉnh sửa hoặc xóa bài hát (tùy vào yêu cầu của đề bài) --- IGNORE ---

import React from "react";

export default function SongPage() {    
    return (
        <div className="song-page">
            <h1>Song Page</h1>
            <p>This page will display a list of songs with options to view details, create, edit, or delete songs.</p>
        </div>
    );
}