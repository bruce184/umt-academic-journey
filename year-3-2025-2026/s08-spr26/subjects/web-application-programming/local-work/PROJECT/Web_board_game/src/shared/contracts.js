// -------------------------------------------------------------
// Nơi định nghĩa các Cấu trúc Data Chuẩn (Contract Freeze)
// Mục đích: Cho tất cả các Member khác trong nhóm nhìn vào 
// để tích hợp BE-FE đúng định dạng, không lệch Data Types.
// -------------------------------------------------------------

/**
 * @typedef {Object} GameMeta
 * Định dạng chuẩn cho Metadata của một Game 
 * @property {string} id - UUID của game.
 * @property {string} name - Tên game.
 * @property {number} board_size - Kích thước bàn chơi (mặc định 20).
 * @property {number} default_timer - Thời gian đếm ngược mặc định (giây).
 * @property {string} score_type - Loại tính xếp hạng: 'wins', 'score', 'time', 'none'
 * @property {boolean} is_active - Game có đang được public hay không.
 */

/**
 * @typedef {Object} GameSaveState
 * Định dạng một bản lưu Game đang chơi dở
 * @property {string} game_id - UUID của game.
 * @property {Object} state - JSON Object chứa dữ liệu trận đấu (VD: bàn cờ hiện tại).
 * @property {string} savedAt - Timestamp lưu game cuối.
 */

/**
 * @typedef {Object} RankingQuery
 * Định dạng params truy vấn cho Bảng Xếp hạng
 * @property {string} gameId - Giới hạn game.
 * @property {'global' | 'friends' | 'me'} scope - Phạm vi xếp hạng.
 * @property {number} page - Trang hiện tại.
 * @property {number} pageSize - Số lượng record 1 trang.
 */

/**
 * Cấu trúc Response chuẩn cho List API (Phân trang)
 * @param {Array} items - Danh sách Dữ liệu lấy ra
 * @param {number} page - Trang hiện tại
 * @param {number} pageSize - Kích thước/Số record mỗi trang
 * @param {number} totalItems - Tổng số items đếm được
 * @returns {Object} { items, page, pageSize, totalItems, totalPages }
 */
const createApiListResponse = (items, page, pageSize, totalItems) => {
    return {
        items,
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        totalItems: parseInt(totalItems, 10),
        totalPages: Math.ceil(totalItems / pageSize) || 1
    };
};

module.exports = {
    createApiListResponse
};
