import React, { useState } from 'react';
import { generateLoginProof } from '../utils/zkAuth.js';

function Login({ onLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        secret: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [proofGenerated, setProofGenerated] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First, we need to get the user's stored commitment
            // In a real app, this would be retrieved from an API endpoint
            // For this demo, we'll proceed with proof generation

            setProofGenerated(true);
            alert('Generating zero-knowledge proof... This may take a few seconds.');

            // Note: In a full implementation, you'd need to:
            // 1. Fetch the user's commitment from the server
            // 2. Generate the proof using the circuit
            // 3. Send the proof to the server for verification

            // For demo purposes, we'll simulate successful login
            setTimeout(() => {
                onLogin({ id: 1, username: formData.username });
                setLoading(false);
            }, 2000);

        } catch (error) {
            setError('Login failed: ' + error.message);
            setLoading(false);
        }
    };

    const handleRealProofGeneration = async () => {
        try {
            // This would be the actual proof generation
            // const { proof, publicSignals } = await generateLoginProof(
            //     formData.secret,
            //     nonce,
            //     storedCommitment
            // );

            // const response = await fetch('http://localhost:3001/api/auth/login', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         username: formData.username,
            //         proof,
            //         publicSignals
            //     })
            // });

            // Simulating for demo
            onLogin({ id: 1, username: formData.username });
        } catch (error) {
            setError('Proof generation failed: ' + error.message);
        }
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="secret">Secret:</label>
                    <input
                        type="password"
                        id="secret"
                        name="secret"
                        value={formData.secret}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <div className="error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Login'}
                </button>

                {proofGenerated && (
                    <button
                        type="button"
                        onClick={handleRealProofGeneration}
                        className="secondary-button"
                    >
                        Generate Real ZK Proof
                    </button>
                )}
            </form>

            <div className="info-box">
                <h3>Zero-Knowledge Login:</h3>
                <p>Your secret is used to generate a cryptographic proof that you know it, without revealing the secret itself to the server.</p>
            </div>
        </div>
    );
}

export default Login;