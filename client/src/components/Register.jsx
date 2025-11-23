import React, { useState } from 'react';
import { generateCommitment, generateNonce } from '../utils/zkAuth.js';

function Register({ onRegisterSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        secret: '',
        confirmSecret: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

        if (formData.secret !== formData.confirmSecret) {
            setError('Secrets do not match');
            setLoading(false);
            return;
        }

        try {
            const nonce = generateNonce();
            const commitment = await generateCommitment(formData.secret, nonce);

            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    commitment,
                    nonce
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registration successful! Please save your secret securely.');
                onRegisterSuccess();
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (error) {
            setError('Registration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2>Register</h2>
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
                    <label htmlFor="secret">Secret Password:</label>
                    <input
                        type="password"
                        id="secret"
                        name="secret"
                        value={formData.secret}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmSecret">Confirm Secret:</label>
                    <input
                        type="password"
                        id="confirmSecret"
                        name="confirmSecret"
                        value={formData.confirmSecret}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <div className="error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <div className="info-box">
                <h3>How it works:</h3>
                <p>Your secret is converted into a cryptographic commitment (hash) and stored. The secret itself is never sent to the server.</p>
            </div>
        </div>
    );
}

export default Register;