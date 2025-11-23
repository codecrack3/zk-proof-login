import React, { useState } from 'react';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import './App.css';
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";

function App() {
    const [currentView, setCurrentView] = useState('register');
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentView('register');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                     <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Zero-Knowledge Auth</h1>
                     <p className="text-muted-foreground">Secure authentication without revealing secrets</p>
                </div>
                
                {!user ? (
                    <div className="space-y-6">
                        <div className="flex justify-center space-x-4">
                             <Button 
                                variant={currentView === 'register' ? "default" : "outline"}
                                onClick={() => setCurrentView('register')}
                             >
                                Register
                             </Button>
                             <Button 
                                variant={currentView === 'login' ? "default" : "outline"}
                                onClick={() => setCurrentView('login')}
                             >
                                Login
                             </Button>
                        </div>

                        <div className="flex justify-center">
                            {currentView === 'register' && <Register onRegisterSuccess={() => setCurrentView('login')} />}
                            {currentView === 'login' && <Login onLogin={handleLogin} />}
                        </div>
                    </div>
                ) : (
                     <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Welcome, {user.username}!</CardTitle>
                            <CardDescription>Authentication Successful</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You have successfully authenticated using zero-knowledge proofs.
                                Your secret was never revealed to the server.
                            </p>
                            <Button onClick={handleLogout} variant="destructive" className="w-full">
                                Logout
                            </Button>
                        </CardContent>
                     </Card>
                )}
            </div>
        </div>
    );
}

export default App;
