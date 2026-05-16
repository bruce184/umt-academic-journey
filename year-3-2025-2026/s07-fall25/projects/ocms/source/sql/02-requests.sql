-- Requests(yêucầuhọcvụ)

-- =========================================
-- D. REQUESTS
-- =========================================
CREATE TABLE IF NOT EXISTS requests (
    request_id   SERIAL PRIMARY KEY,
    user_id      INT NOT NULL
                 REFERENCES users(user_id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status       VARCHAR(20) NOT NULL,      -- 'PENDING','APPROVED',...
    request_type VARCHAR(50) NOT NULL,      -- 'WITHDRAW','RECHECK','CERTIFICATE',...
    payload      JSONB                       -- optional: chi tiết form
);
