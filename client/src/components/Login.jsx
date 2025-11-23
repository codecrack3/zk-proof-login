import React, { useState } from 'react';
import { generateCommitment, generateLoginProof } from '../utils/zkAuth.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

function Login({ onLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        secret: '',
        nonce: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const loadStoredNonce = () => {
        if (typeof window === 'undefined' || !formData.username) {
            return;
        }

        const storedNonce = localStorage.getItem(`zkAuth:${formData.username}:nonce`);
        if (storedNonce) {
            setFormData(prev => ({ ...prev, nonce: storedNonce }));
            setError('');
        } else {
            setError('No saved nonce found for this username. Please enter the nonce from registration.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setStatusMessage('Generating zero-knowledge proof...');

        try {
            if (!formData.username || !formData.secret || !formData.nonce) {
                throw new Error('Username, secret, and nonce are required.');
            }

            const commitment = await generateCommitment(formData.secret, formData.nonce);
            const { proof, publicSignals } = await generateLoginProof(
                formData.secret,
                formData.nonce,
                commitment
            );

            setStatusMessage('Submitting proof for verification...');

            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    proof,
                    publicSignals
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed');
            }

            setStatusMessage('');
            onLogin(result.user);

        } catch (error) {
            console.error('Login failed:', error);
            setError(error.message || 'Login failed');
            setStatusMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Authenticate with Zero-Knowledge Proofs</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Your username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={loadStoredNonce}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="secret">Secret</Label>
                            <Input
                                id="secret"
                                name="secret"
                                type="password"
                                placeholder="Your secret"
                                value={formData.secret}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="nonce">Nonce</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="nonce"
                                    name="nonce"
                                    type="text"
                                    placeholder="Enter saved nonce"
                                    value={formData.nonce}
                                    onChange={handleChange}
                                    required
                                />
                                <Button type="button" variant="outline" onClick={loadStoredNonce}>
                                    Load
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-2 mt-4 rounded-md">
                            {error}
                        </div>
                    )}

                    {statusMessage && (
                        <div className="bg-primary/10 text-primary text-xs p-2 mt-2 rounded-md">
                            {statusMessage}
                        </div>
                    )}
                    
                    <Button className="w-full mt-6" type="submit" disabled={loading}>
                         {loading ? 'Authenticating...' : 'Login'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
                 <p className="text-xs text-muted-foreground mt-2">
                    Your secret and nonce stay on your device. The server only receives a zero-knowledge proof and the public signals (commitment + nonce) required for verification.
                </p>
            </CardFooter>
        </Card>
    );
}

export default Login;
