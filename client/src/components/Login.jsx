import React from 'react';

function Login({ onLogin }) {
    return (
        <div className="auth-form">
            <h2>Login</h2>
            <p>Login component coming soon...</p>
            <button onClick={() => onLogin({ id: 1, username: 'testuser' })}>Mock Login</button>
        </div>
    );
}

export default Login;