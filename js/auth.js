// js/auth.js

// Import API_URL from config.js (Ensure you link config.js in your HTML files)

document.addEventListener('DOMContentLoaded', () => {
    // Only run the login logic on the index page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        checkAuthentication();
    }
});

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDisplay = document.getElementById('login-message');
    
    messageDisplay.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();

        if (result.success) {
            // Store the user role and name from the server response
            localStorage.setItem('userRole', result.role);
            localStorage.setItem('username', result.username);

            // Redirect based on role
            if (result.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (result.role === 'worker') {
                window.location.href = 'worker-pos.html';
            }
        } else {
            messageDisplay.textContent = result.message || "Login failed.";
        }
    } catch (error) {
        messageDisplay.textContent = "Error connecting to the server. Is the backend running?";
        console.error('Login Error:', error);
    }
}

// ... (logout and checkAuthentication functions remain the same) ...