// Admin Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the admin login page
    initializeAdminLogin();
    
    // Setup event listeners
    setupEventListeners();
    
    // Create particles
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Initialize admin login
function initializeAdminLogin() {
    // Focus on username field
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        setTimeout(() => {
            usernameInput.focus();
        }, 500);
    }
    
    // Check for saved credentials
    checkSavedCredentials();
}

// Check for saved credentials
function checkSavedCredentials() {
    const rememberMe = localStorage.getItem('adminRememberMe');
    const savedUsername = localStorage.getItem('adminUsername');
    
    if (rememberMe === 'true' && savedUsername) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('rememberMe').checked = true;
    }
}

// Setup event listeners
function setupEventListeners() {
    const adminAuthForm = document.getElementById('adminAuthForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const forgotPassword = document.getElementById('forgotPassword');
    const passwordInput = document.getElementById('password');
    
    // Form submission
    adminAuthForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAdminLogin();
    });
    
    // Password toggle
    passwordToggle.addEventListener('click', function() {
        togglePasswordVisibility();
    });
    
    // Forgot password
    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotModal();
    });
    
    // Enhanced security focus
    passwordInput.addEventListener('focus', function() {
        this.classList.add('security-focused');
    });
    
    passwordInput.addEventListener('blur', function() {
        this.classList.remove('security-focused');
    });
    
    // Modal events
    setupModalEvents();
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggle').querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Handle admin login
function handleAdminLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginButton = document.getElementById('adminAuthForm').querySelector('.admin-auth-button');
    
    // Basic validation
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    // Show loading state
    loginButton.classList.add('loading');
    loginButton.disabled = true;
    
    // Save credentials if remember me is checked
    if (rememberMe) {
        localStorage.setItem('adminRememberMe', 'true');
        localStorage.setItem('adminUsername', username);
    } else {
        localStorage.removeItem('adminRememberMe');
        localStorage.removeItem('adminUsername');
    }
    
    // Simulate API call (replace with actual authentication)
    setTimeout(() => {
        // Mock authentication - In real app, this would be an API call
        const isValid = authenticateAdmin(username, password);
        
        if (isValid) {
            loginSuccess();
        } else {
            loginFailed();
        }
        
        // Reset button state
        loginButton.classList.remove('loading');
        loginButton.disabled = false;
    }, 2000);
}

// Mock authentication function
function authenticateAdmin(username, password) {
    // In a real application, this would be an API call to your backend
    // For demo purposes, using mock credentials
    const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'supervisor', password: 'super123' },
        { username: 'examofficer', password: 'exam123' }
    ];
    
    return validCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
}

// Login success
function loginSuccess() {
    // Show success message
    showSuccess('Authentication successful! Redirecting to admin dashboard...');
    
    // Log the login attempt
    console.log(`Admin login successful: ${document.getElementById('username').value}`);
    
    // Redirect to admin dashboard
    setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
    }, 1500);
}

// Login failed
function loginFailed() {
    // Show error with shake animation
    showError('Invalid credentials. Please check your username and password.');
    
    // Add shake animation to form
    const form = document.getElementById('adminAuthForm');
    form.classList.add('shake');
    
    // Remove shake animation after completion
    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);
    
    // Log the failed attempt
    console.warn(`Failed admin login attempt: ${document.getElementById('username').value}`);
    
    // Clear password field
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
}

// Show error message
function showError(message) {
    // Remove any existing error
    const existingError = document.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error element
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
    
    // Insert before the submit button
    const form = document.getElementById('adminAuthForm');
    const submitButton = form.querySelector('.admin-auth-button');
    form.insertBefore(errorElement, submitButton);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-success');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create success element
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
    
    // Insert before the submit button
    const form = document.getElementById('adminAuthForm');
    const submitButton = form.querySelector('.admin-auth-button');
    form.insertBefore(successElement, submitButton);
}

// Show forgot password modal
function showForgotModal() {
    const modal = document.getElementById('forgotModal');
    modal.style.display = 'flex';
    
    setTimeout(() => {
        modal.querySelector('.modal').style.transform = 'scale(1)';
        modal.querySelector('.modal').style.opacity = '1';
    }, 100);
}

// Setup modal events
function setupModalEvents() {
    const forgotModal = document.getElementById('forgotModal');
    const forgotModalClose = document.getElementById('forgotModalClose');
    const closeForgotModal = document.getElementById('closeForgotModal');
    const contactSupportBtn = document.getElementById('contactSupportBtn');
    
    // Close modal events
    forgotModalClose.addEventListener('click', () => closeModal('forgotModal'));
    closeForgotModal.addEventListener('click', () => closeModal('forgotModal'));
    
    // Contact support button
    contactSupportBtn.addEventListener('click', () => {
        // In a real app, this would open email client or support ticket system
        window.location.href = 'mailto:admin-support@smartexams.edu?subject=Admin Password Recovery';
        closeModal('forgotModal');
    });
    
    // Close modal when clicking outside
    forgotModal.addEventListener('click', (e) => {
        if (e.target === forgotModal) {
            closeModal('forgotModal');
        }
    });
}

// Close modal
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
    // Ctrl + Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        const loginButton = document.querySelector('.admin-auth-button');
        if (!loginButton.disabled) {
            loginButton.click();
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                closeModal(modal.id);
            }
        });
    }
});