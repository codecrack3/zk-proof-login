import React, { useState } from 'react';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import './App.css';

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
        <div className="App">
            <header className="App-header">
                <h1>Zero-Knowledge Authentication</h1>
                <nav>
                    {!user && (
                        <>
                            <button
                                onClick={() => setCurrentView('register')}
                                className={currentView === 'register' ? 'active' : ''}
                            >
                                Register
                            </button>
                            <button
                                onClick={() => setCurrentView('login')}
                                className={currentView === 'login' ? 'active' : ''}
                            >
                                Login
                            </button>
                        </>
                    )}
                    {user && (
                        <button onClick={handleLogout}>Logout</button>
                    )}
                </nav>
            </header>

            <main>
                {currentView === 'register' && <Register onRegisterSuccess={() => setCurrentView('login')} />}
                {currentView === 'login' && <Login onLogin={handleLogin} />}
                {currentView === 'dashboard' && (
                    <div>
                        <h2>Welcome, {user.username}!</h2>
                        <p>You have successfully authenticated using zero-knowledge proofs.</p>
                        <p>Your secret was never revealed to the server.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;