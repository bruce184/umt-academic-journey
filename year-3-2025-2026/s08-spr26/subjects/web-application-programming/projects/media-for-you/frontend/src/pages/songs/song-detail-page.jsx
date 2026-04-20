// Đây là trang hiển thị chi tiết một bài hát, với URL /songs/:id --- IGNORE ---
// Trang này sẽ hiển thị thông tin chi tiết của bài hát, có thể có các chức năng như chỉnh sửa hoặc xóa bài hát (tùy vào yêu cầu của đề bài) --- IGNORE ---

import React from "react";
export default function SongDetailPage() {
    return (
        <div className="song-detail-page">
            <h1>Song Detail Page</h1>
            <p>This page will display detailed information about a specific song, with options to edit or delete the song.</p>
        </div>
    );
}