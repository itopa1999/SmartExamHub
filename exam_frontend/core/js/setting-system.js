// DOM Elements
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const successText = document.getElementById('successText');
const errorText = document.getElementById('errorText');
const logoUpload = document.getElementById('logoUpload');
const logoInput = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');
const currentLogo = document.getElementById('currentLogo');

// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const settingsSections = document.querySelectorAll('.settings-section');

// Default settings (for demo purposes)
const defaultSettings = {
    branding: {
        institutionName: 'SmartExams University',
        systemTitle: 'SmartExam Portal',
        adminEmail: 'admin@smartexams.edu',
        supportEmail: 'support@smartexams.edu',
        contactPhone: '+1 (555) 123-4567'
    },
    exam: {
        examDuration: 60,
        passingPercentage: 60,
        maxAttempts: 3,
        randomizeQuestions: true,
        showCorrectAnswers: true,
        allowQuestionReview: true,
        commenceExamImmediately: false
    },
    security: {
        browserRestrictions: true,
        fullScreenEnforcement: true,
        copyPastePrevention: true,
        rightClickDisabled: true,
        keyboardShortcutsDisabled: false
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSettings();
    setupNavigation();
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Setup event listeners
function setupEventListeners() {
    // Logo upload
    logoUpload.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', handleLogoUpload);

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

// Setup navigation
function setupNavigation() {
    // Show first section by default
    settingsSections.forEach((section, index) => {
        if (index === 0) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Handle navigation clicks
function handleNavClick(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href').substring(1);
    
    // Update active nav link
    navLinks.forEach(link => link.classList.remove('active'));
    this.classList.add('active');
    
    // Show target section
    settingsSections.forEach(section => {
        if (section.id === targetId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Handle logo upload
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, or SVG).');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB.');
        return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        currentLogo.src = e.target.result;
        logoPreview.classList.add('show');
    };
    reader.readAsDataURL(file);

    showSuccess('Logo uploaded successfully. Remember to save changes.');
}

// Load settings from localStorage or use defaults
function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('systemSettings')) || defaultSettings;

    // Branding settings
    document.getElementById('institutionName').value = savedSettings.branding.institutionName;
    document.getElementById('systemTitle').value = savedSettings.branding.systemTitle;
    document.getElementById('adminEmail').value = savedSettings.branding.adminEmail;
    document.getElementById('supportEmail').value = savedSettings.branding.supportEmail;
    document.getElementById('contactPhone').value = savedSettings.branding.contactPhone;

    // Exam settings
    document.getElementById('examDuration').value = savedSettings.exam.examDuration;
    document.getElementById('passingPercentage').value = savedSettings.exam.passingPercentage;
    document.getElementById('maxAttempts').value = savedSettings.exam.maxAttempts;
    document.getElementById('randomizeQuestions').checked = savedSettings.exam.randomizeQuestions;
    document.getElementById('showCorrectAnswers').checked = savedSettings.exam.showCorrectAnswers;
    document.getElementById('allowQuestionReview').checked = savedSettings.exam.allowQuestionReview;
    document.getElementById('commenceExamImmediately').checked = savedSettings.exam.commenceExamImmediately;

    // Security settings
    document.getElementById('browserRestrictions').checked = savedSettings.security.browserRestrictions;
    document.getElementById('fullScreenEnforcement').checked = savedSettings.security.fullScreenEnforcement;
    document.getElementById('copyPastePrevention').checked = savedSettings.security.copyPastePrevention;
    document.getElementById('rightClickDisabled').checked = savedSettings.security.rightClickDisabled;
    document.getElementById('keyboardShortcutsDisabled').checked = savedSettings.security.keyboardShortcutsDisabled;
}

// Save section settings
function saveSection(section) {
    const settings = JSON.parse(localStorage.getItem('systemSettings')) || defaultSettings;

    switch(section) {
        case 'branding':
            settings.branding = {
                institutionName: document.getElementById('institutionName').value,
                systemTitle: document.getElementById('systemTitle').value,
                adminEmail: document.getElementById('adminEmail').value,
                supportEmail: document.getElementById('supportEmail').value,
                contactPhone: document.getElementById('contactPhone').value
            };
            break;
        
        case 'exam':
            settings.exam = {
                examDuration: parseInt(document.getElementById('examDuration').value),
                passingPercentage: parseInt(document.getElementById('passingPercentage').value),
                maxAttempts: parseInt(document.getElementById('maxAttempts').value),
                randomizeQuestions: document.getElementById('randomizeQuestions').checked,
                showCorrectAnswers: document.getElementById('showCorrectAnswers').checked,
                allowQuestionReview: document.getElementById('allowQuestionReview').checked,
                commenceExamImmediately: document.getElementById('commenceExamImmediately').checked
            };
            break;
        
        case 'security':
            settings.security = {
                browserRestrictions: document.getElementById('browserRestrictions').checked,
                fullScreenEnforcement: document.getElementById('fullScreenEnforcement').checked,
                copyPastePrevention: document.getElementById('copyPastePrevention').checked,
                rightClickDisabled: document.getElementById('rightClickDisabled').checked,
                keyboardShortcutsDisabled: document.getElementById('keyboardShortcutsDisabled').checked
            };
            break;
    }

    // Save to localStorage
    localStorage.setItem('systemSettings', JSON.stringify(settings));

    showSuccess(`${getSectionName(section)} settings saved successfully!`);
    
    // Demo: Show effect of changes
    if (section === 'branding') {
        demoBrandingChanges(settings.branding);
    }
}

// Reset section to defaults
function resetSection(section) {
    if (!confirm('Are you sure you want to reset this section to default values?')) {
        return;
    }

    switch(section) {
        case 'branding':
            document.getElementById('institutionName').value = defaultSettings.branding.institutionName;
            document.getElementById('systemTitle').value = defaultSettings.branding.systemTitle;
            document.getElementById('adminEmail').value = defaultSettings.branding.adminEmail;
            document.getElementById('supportEmail').value = defaultSettings.branding.supportEmail;
            document.getElementById('contactPhone').value = defaultSettings.branding.contactPhone;
            logoPreview.classList.remove('show');
            break;
        
        case 'exam':
            document.getElementById('examDuration').value = defaultSettings.exam.examDuration;
            document.getElementById('passingPercentage').value = defaultSettings.exam.passingPercentage;
            document.getElementById('maxAttempts').value = defaultSettings.exam.maxAttempts;
            document.getElementById('randomizeQuestions').checked = defaultSettings.exam.randomizeQuestions;
            document.getElementById('showCorrectAnswers').checked = defaultSettings.exam.showCorrectAnswers;
            document.getElementById('allowQuestionReview').checked = defaultSettings.exam.allowQuestionReview;
            document.getElementById('commenceExamImmediately').checked = defaultSettings.exam.commenceExamImmediately;
            break;
        
        case 'security':
            document.getElementById('browserRestrictions').checked = defaultSettings.security.browserRestrictions;
            document.getElementById('fullScreenEnforcement').checked = defaultSettings.security.fullScreenEnforcement;
            document.getElementById('copyPastePrevention').checked = defaultSettings.security.copyPastePrevention;
            document.getElementById('rightClickDisabled').checked = defaultSettings.security.rightClickDisabled;
            document.getElementById('keyboardShortcutsDisabled').checked = defaultSettings.security.keyboardShortcutsDisabled;
            break;
    }

    showSuccess(`${getSectionName(section)} settings reset to defaults.`);
}

// Get section display name
function getSectionName(section) {
    const names = {
        branding: 'Branding & General',
        exam: 'Exam',
        security: 'Security'
    };
    return names[section] || section;
}

// Demo: Show branding changes effect
function demoBrandingChanges(branding) {
    const brandText = document.querySelector('.brand-text');
    if (brandText) {
        brandText.textContent = branding.systemTitle;
    }
    
    showSuccess(`System title updated to: "${branding.systemTitle}" (Demo)`);
}

// Show success message
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.add('show');
    errorMessage.classList.remove('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('show');
    successMessage.classList.remove('show');
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}
