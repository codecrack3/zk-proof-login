import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getDb() {
    return new sqlite3.Database(path.join(__dirname, '../database.sqlite'));
}

export async function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = getDb();

        const createTables = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                commitment TEXT NOT NULL,
                nonce TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS auth_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                session_proof TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        `;

        db.exec(createTables, (err) => {
            if (err) {
                console.error('Database initialization failed:', err);
                reject(err);
            } else {
                console.log("Database initialized successfully");
                db.close();
                resolve();
            }
        });
    });
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initDatabase().catch(console.error);
}