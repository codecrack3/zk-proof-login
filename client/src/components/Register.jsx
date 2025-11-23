import React, { useState } from 'react';
import { generateCommitment, generateNonce } from '../utils/zkAuth.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

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
                try {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(`zkAuth:${formData.username}:nonce`, nonce);
                        localStorage.setItem(`zkAuth:${formData.username}:commitment`, commitment);
                    }
                } catch (storageError) {
                    console.warn('Unable to store nonce locally:', storageError);
                }

                alert(`Registration successful! Save your secret and this nonce for future logins: ${nonce}`);
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
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new Zero-Knowledge Account</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                             <Label htmlFor="secret">Secret Password</Label>
                             <Input
                                id="secret"
                                name="secret"
                                type="password"
                                placeholder="Enter a strong secret"
                                value={formData.secret}
                                onChange={handleChange}
                                required
                            />
                        </div>
                         <div className="flex flex-col space-y-1.5">
                             <Label htmlFor="confirmSecret">Confirm Secret</Label>
                             <Input
                                id="confirmSecret"
                                name="confirmSecret"
                                type="password"
                                placeholder="Confirm your secret"
                                value={formData.confirmSecret}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-2 mt-4 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button className="w-full mt-6" type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
                <p className="text-xs text-muted-foreground mt-2">
                    Your secret is converted into a cryptographic commitment (hash) and stored. The secret itself is never sent to the server.
                </p>
            </CardFooter>
        </Card>
    );
}

export default Register;
