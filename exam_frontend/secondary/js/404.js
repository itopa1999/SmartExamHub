// 404 Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Create particles
    if (typeof createParticles === 'function') {
        createParticles();
    }
    
    // Add any additional 404 page interactions here
    console.log('404 page loaded');
    
    // Auto-redirect after 10 seconds
    setTimeout(() => {
        console.log('Auto-redirecting to dashboard...');
        // window.location.href = 'dashboard.html';
    }, 10000);


    hidePreloader();
});