// Auth Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    const authForm = document.getElementById('authForm');
    const studentIdInput = document.getElementById('studentId');
    
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentId = studentIdInput.value.trim();
        
        // Basic validation
        if (!studentId) {
            showError('Please enter your Student ID');
            return;
        }
        
        // Validate student ID format (basic example)
        if (studentId.length < 3) {
            showError('Student ID must be at least 3 characters long');
            return;
        }
        
        // Show loading state
        const submitButton = authForm.querySelector('.auth-button');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Authenticating...</span>';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Success - redirect to exam page
            alert(`Authentication successful! Welcome, Student ${studentId}. Redirecting to exam...`);
            
            window.location.href = `dashboard.html?studentId=${studentId}&type=secondary`;
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 1500);
    });
    
    // Input focus effect
    studentIdInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    studentIdInput.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
    
    // Error display function
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
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.2);
            color: #ff2e63;
            padding: 0.8rem 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        `;
        
        // Insert after the form
        authForm.appendChild(errorElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000);
    }
    
    createParticles();

    hidePreloader();
});

