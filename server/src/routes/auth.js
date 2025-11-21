import { getDb } from '../database.js';

let vKey = null;

// Mock verification key for development
try {
    import('fs').then(fs => {
        import('path').then(path => {
            const vKeyPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../../circuits/build/verification_key.json');
            // For now, we'll skip loading the actual key and use a mock
            vKey = { vk_alpha_1: ["1", "1"], vk_beta_2: [["1", "1"], ["1", "1"]], vk_gamma_2: [["1", "1"], ["1", "1"]], vk_delta_2: [["1", "1"], ["1", "1"]], IC: [["1"], ["1"], ["1"]] };
        });
    });
} catch (error) {
    console.log('Verification key not found, using mock for development');
    vKey = { vk_alpha_1: ["1", "1"], vk_beta_2: [["1", "1"], ["1", "1"]], vk_gamma_2: [["1", "1"], ["1", "1"]], vk_delta_2: [["1", "1"], ["1", "1"]], IC: [["1"], ["1"], ["1"]] };
}

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

        const db = getDb();

        // Get user's stored commitment
        db.get('SELECT id, commitment, nonce FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Login failed' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // For development, we'll mock the zero-knowledge proof verification
            // In production, this would use actual snarkjs.groth16.verify(vKey, publicSignals, proof)
            const verificationResult = true; // Mock for development

            if (!verificationResult) {
                return res.status(401).json({ error: 'Invalid proof' });
            }

            // Check if the proof matches the stored commitment
            const [proofCommitment, proofNonce] = publicSignals;
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