// Admin Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminLogin();
    setupEventListeners();

    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Initialize admin login
function initializeAdminLogin() {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        setTimeout(() => usernameInput.focus(), 500);
    }
}

// Setup event listeners
function setupEventListeners() {
    const adminAuthForm = document.getElementById('adminAuthForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const forgotPassword = document.getElementById('forgotPassword');
    const passwordInput = document.getElementById('password');

    adminAuthForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleAdminLogin();
    });

    passwordToggle.addEventListener('click', togglePasswordVisibility);

    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotModal();
    });

    passwordInput.addEventListener('focus', function() {
        this.classList.add('security-focused');
    });

    passwordInput.addEventListener('blur', function() {
        this.classList.remove('security-focused');
    });

    setupModalEvents();
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggle').querySelector('i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Handle admin login (FIXED)
async function handleAdminLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginButton = document.querySelector('.admin-auth-button');

    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }

    loginButton.classList.add('loading');
    loginButton.disabled = true;

    const isValid = await authenticateAdmin(username, password); // WAIT for API

    if (isValid) {
        loginSuccess();
    } else {
        loginFailed();
    }

    loginButton.classList.remove('loading');
    loginButton.disabled = false;
}

async function authenticateAdmin(username, password) {
    try {
        const res = await fetch(`${CORE_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        console.log("LOGIN RESPONSE:", data);

        if (!res.ok || data.is_success !== true) {
            showError('Invalid credentials. Please check your username and password.');
            return false;
        }

        CookieManager.set('access_token', data.data.access_token);
        CookieManager.set('refresh_token', data.data.refresh_token);
        CookieManager.set('admin_username', data.data.username);
        CookieManager.set('admin_email', data.data.email);
        CookieManager.set('admin_first_name', data.data.first_name);
        CookieManager.set('admin_last_name', data.data.last_name);

        return true;

    } catch (err) {
        showError("LOGIN ERROR:", err);
        console.error("LOGIN ERROR:", err);
        return false;
    }
}

// Login success
function loginSuccess() {
    window.location.href = 'admin-dashboard.html';
    // showSuccess('Authentication successful! Redirecting to admin dashboard...');
    // setTimeout(() => {
    //     window.location.href = 'admin-dashboard.html';
    // }, 1500);
}

// Login failed
function loginFailed() {
    const form = document.getElementById('adminAuthForm');
    form.classList.add('shake');

    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);

    document.getElementById('password').value = '';
    document.getElementById('password').focus();
}

// Error message UI
function showError(message) {
    const existingError = document.querySelector('.form-error');
    if (existingError) existingError.remove();

    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    errorElement.style.cssText = `
        background: rgba(255, 46, 99, 0.1);
        border: 1px solid rgba(255, 46, 99, 0.2);
        color: var(--accent);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 0.9rem;
        font-weight: 500;
    `;

    const form = document.getElementById('adminAuthForm');
    const submitButton = form.querySelector('.admin-auth-button');
    form.insertBefore(errorElement, submitButton);

    setTimeout(() => {
        if (errorElement.parentNode) errorElement.remove();
    }, 5000);
}

// Success message UI
function showSuccess(message) {
    const existingMessage = document.querySelector('.form-success');
    if (existingMessage) existingMessage.remove();

    const successElement = document.createElement('div');
    successElement.className = 'form-success';
    successElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    successElement.style.cssText = `
        background: rgba(40, 167, 69, 0.1);
        border: 1px solid rgba(40, 167, 69, 0.2);
        color: var(--success-color);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 0.9rem;
        font-weight: 500;
    `;

    const form = document.getElementById('adminAuthForm');
    const submitButton = form.querySelector('.admin-auth-button');
    form.insertBefore(successElement, submitButton);
}

// Forgot password modal
function showForgotModal() {
    const modal = document.getElementById('forgotModal');
    modal.style.display = 'flex';

    setTimeout(() => {
        const modalContent = modal.querySelector('.modal');
        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';
    }, 100);
}

function setupModalEvents() {
    const forgotModal = document.getElementById('forgotModal');
    const forgotModalClose = document.getElementById('forgotModalClose');
    const closeForgotModal = document.getElementById('closeForgotModal');

    forgotModalClose.addEventListener('click', () => closeModal('forgotModal'));
    closeForgotModal.addEventListener('click', () => closeModal('forgotModal'));

    forgotModal.addEventListener('click', (e) => {
        if (e.target === forgotModal) closeModal('forgotModal');
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal');

    modalContent.style.transform = 'scale(0.9)';
    modalContent.style.opacity = '0';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        const loginButton = document.querySelector('.admin-auth-button');
        if (!loginButton.disabled) loginButton.click();
    }

    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                closeModal(modal.id);
            }
        });
    }
});
