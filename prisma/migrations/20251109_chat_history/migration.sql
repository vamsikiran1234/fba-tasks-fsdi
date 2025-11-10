-- CreateTable: chat_history
-- Store persistent chat conversations with SQL queries and results

CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    sql_query TEXT,
    results JSONB,
    error TEXT,
    "executionTime" INTEGER, -- milliseconds
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user ON chat_history("userId");
CREATE INDEX idx_chat_history_created ON chat_history("createdAt" DESC);

-- Insert sample chat history for demo
INSERT INTO chat_history ("userId", query, sql_query, results, "executionTime") VALUES
(1, 'What is the total spend?', 'SELECT SUM(ed."totalAmount") as total FROM extracted_data ed', '{"total": 31564.52}', 156),
(1, 'How many pending invoices?', 'SELECT COUNT(*) FROM invoices WHERE status = ''PENDING''', '{"count": 50}', 89),
(1, 'Top 5 vendors', 'SELECT ed."vendorName", SUM(ed."totalAmount") as total FROM extracted_data ed GROUP BY ed."vendorName" ORDER BY total DESC LIMIT 5', '{}', 234);
