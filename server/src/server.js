import express from 'express';
import cors from 'cors';
import { register, login } from './routes/auth.js';
import { initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
try {
    await initDatabase();
    console.log('Database initialized');
} catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`ZK Auth server running on port ${PORT}`);
});