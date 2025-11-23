import fs from 'fs';
import path from 'path';
import { groth16 } from 'snarkjs';
import { fileURLToPath } from 'url';
import { getDb } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadVerificationKey() {
    const candidates = [
        path.resolve(__dirname, '../../../circuits/build/verification_key.json'),
        path.resolve(process.cwd(), '../circuits/build/verification_key.json'),
        path.resolve(process.cwd(), 'circuits/build/verification_key.json')
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            console.log(`Loaded verification key from ${candidate}`);
            return JSON.parse(fs.readFileSync(candidate, 'utf8'));
        }
    }

    console.warn('Verification key not found. Run `npm run compile:circuit` before logging in.');
    return null;
}

let vKey = loadVerificationKey();

export async function register(req, res) {
    try {
        const { username, commitment, nonce } = req.body;

        if (!username || !commitment || !nonce) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = getDb();

        // Check if user already exists
        db.get('SELECT id FROM users WHERE username = ?', [username], (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Registration failed' });
            }

            if (existingUser) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Store user with commitment (hashed secret)
            db.run(
                'INSERT INTO users (username, commitment, nonce) VALUES (?, ?, ?)',
                [username, commitment, nonce],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Registration failed' });
                    }

                    res.json({ success: true, message: 'User registered successfully' });
                }
            );
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
}

export async function login(req, res) {
    try {
        const { username, proof, publicSignals } = req.body;

        if (!username || !proof || !publicSignals) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!Array.isArray(publicSignals) || publicSignals.length < 2) {
            return res.status(400).json({ error: 'Invalid public signals' });
        }

        if (!vKey) {
            return res.status(500).json({ error: 'Verification key unavailable. Please compile the circuit first.' });
        }

        const db = getDb();

        // Get user's stored commitment
        db.get('SELECT id, commitment, nonce FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Login failed' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            let verificationResult = false;
            try {
                verificationResult = await groth16.verify(vKey, publicSignals, proof);
            } catch (verifyError) {
                console.error('Proof verification failed:', verifyError);
                return res.status(500).json({ error: 'Proof verification failed' });
            }

            if (!verificationResult) {
                return res.status(401).json({ error: 'Invalid proof' });
            }

            // Check if the proof matches the stored commitment
            // publicSignals order: [out, commitment, nonce] - out is the circuit output (1=valid)
            const [proofOut, proofCommitment] = publicSignals.map(String);

            if (proofOut !== "1") {
                return res.status(401).json({ error: 'Proof output indicates invalid credentials' });
            }

            if (proofCommitment !== user.commitment) {
                return res.status(401).json({ error: 'Commitment mismatch' });
            }

            // Create session
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            db.run(
                'INSERT INTO auth_sessions (user_id, session_proof, expires_at) VALUES (?, ?, ?)',
                [user.id, JSON.stringify(proof), expiresAt.toISOString()],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Login failed' });
                    }

                    res.json({
                        success: true,
                        message: 'Login successful',
                        user: { id: user.id, username }
                    });
                }
            );
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}
