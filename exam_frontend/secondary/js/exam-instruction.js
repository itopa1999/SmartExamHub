// Exam Instruction JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Create particles
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Initialize the page with exam data
function initializePage() {
    // Get exam data from URL parameters or default data
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module') || '1';
    const moduleData = getModuleData(moduleId);
    
    // Populate page with exam data
    populateExamData(moduleData);
    
    // Check if there's existing progress
    checkExistingProgress(moduleId);
    
    // Setup scroll detection for start button
    setupScrollDetection();
}

// Get module data (simulated - in real app, this would come from backend/API)
function getModuleData(moduleId) {
    const modules = {
        '1': {
            name: 'Mathematics',
            examTitle: 'Mathematics Final Examination',
            subtitle: 'Secondary Education - Term 3 Assessment',
            timeAllocated: '2 Hours',
            totalQuestions: 50,
            instructions: 'Complete all questions within the time limit.'
        },
        '2': {
            name: 'Physics',
            examTitle: 'Physics Mid-Term Assessment',
            subtitle: 'Secondary Education - Term 2 Assessment',
            timeAllocated: '1.5 Hours',
            totalQuestions: 40,
            instructions: 'Show all working for calculation questions.'
        },
        '3': {
            name: 'Chemistry',
            examTitle: 'Chemistry Practical Theory',
            subtitle: 'Secondary Education - Term 1 Assessment',
            timeAllocated: '1 Hour',
            totalQuestions: 30,
            instructions: 'Answer all questions in the provided spaces.'
        },
        '4': {
            name: 'Biology',
            examTitle: 'Biology Life Sciences Exam',
            subtitle: 'Secondary Education - Final Assessment',
            timeAllocated: '2.5 Hours',
            totalQuestions: 60,
            instructions: 'Diagrams must be clearly labeled.'
        },
        '5': {
            name: 'English Language',
            examTitle: 'English Language Proficiency Test',
            subtitle: 'Secondary Education - Comprehensive Assessment',
            timeAllocated: '2 Hours',
            totalQuestions: 45,
            instructions: 'Essay questions require minimum 300 words.'
        },
        '6': {
            name: 'Computer Science',
            examTitle: 'Computer Science Programming Exam',
            subtitle: 'Secondary Education - Practical Assessment',
            timeAllocated: '3 Hours',
            totalQuestions: 35,
            instructions: 'Code must be properly indented and commented.'
        }
    };
    
    return modules[moduleId] || modules['1'];
}

// Populate exam data on the page
function populateExamData(moduleData) {
    document.getElementById('examTitle').textContent = moduleData.examTitle;
    document.getElementById('examSubtitle').textContent = moduleData.subtitle;
    document.getElementById('moduleBreadcrumb').textContent = moduleData.name;
    document.getElementById('timeAllocated').textContent = moduleData.timeAllocated;
    document.getElementById('totalQuestions').textContent = moduleData.totalQuestions;
    
    // Update time remaining (initially same as allocated time)
    document.getElementById('timeRemaining').textContent = moduleData.timeAllocated;
}

// Check for existing exam progress
function checkExistingProgress(moduleId) {
    // In a real app, this would check localStorage or make an API call
    const progress = localStorage.getItem(`exam_progress_${moduleId}`);
    
    if (progress) {
        const progressData = JSON.parse(progress);
        updateProgressDisplay(progressData);
        document.getElementById('examStatus').textContent = 'In Progress';
        document.getElementById('examStatus').style.background = 'var(--accent)';
    }
}

// Update progress display with existing data
function updateProgressDisplay(progressData) {
    document.getElementById('questionsAttempted').textContent = 
        `${progressData.attempted}/${progressData.total}`;
    
    // Calculate and display remaining time
    if (progressData.startTime && progressData.timeAllocated) {
        const timeElapsed = Math.floor((Date.now() - progressData.startTime) / 1000 / 60); // minutes
        const totalMinutes = parseTimeToMinutes(progressData.timeAllocated);
        const remainingMinutes = Math.max(0, totalMinutes - timeElapsed);
        const remainingTime = formatMinutesToTime(remainingMinutes);
        
        document.getElementById('timeRemaining').textContent = remainingTime;
        document.getElementById('timeRemaining').style.color = 
            remainingMinutes < 30 ? 'var(--accent)' : 'var(--primary)';
    }
}

// Parse time string to minutes (e.g., "2 Hours" -> 120)
function parseTimeToMinutes(timeString) {
    const match = timeString.match(/(\d+(?:\.\d+)?)\s*(hour|minute)/i);
    if (!match) return 120; // Default 2 hours
    
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    return unit === 'hour' ? value * 60 : value;
}

// Format minutes to time string (e.g., 125 -> "2 Hours 5 Minutes")
function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
        return `${mins} Minute${mins !== 1 ? 's' : ''}`;
    } else if (mins === 0) {
        return `${hours} Hour${hours !== 1 ? 's' : ''}`;
    } else {
        return `${hours} Hour${hours !== 1 ? 's' : ''} ${mins} Minute${mins !== 1 ? 's' : ''}`;
    }
}

// Setup event listeners
function setupEventListeners() {
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const startExamBtn = document.getElementById('startExamBtn');
    
    // Agreement checkbox
    agreeCheckbox.addEventListener('change', function() {
        startExamBtn.disabled = !this.checked;
    });
    
    // Start exam button
    startExamBtn.addEventListener('click', function() {
        startExam();
    });
    
    // Add visual feedback when scrolling to bottom
    window.addEventListener('scroll', function() {
        const startSection = document.querySelector('.start-exam-section');
        const rect = startSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
            startSection.classList.add('visible');
        }
    });
}

// Setup scroll detection for the start button
function setupScrollDetection() {
    const startSection = document.querySelector('.start-exam-section');
    const scrollNotice = document.querySelector('.scroll-notice');
    
    // Check initial position
    checkScrollPosition();
    
    // Check on scroll
    window.addEventListener('scroll', checkScrollPosition);
    
    function checkScrollPosition() {
        const instructionsContent = document.querySelector('.instructions-content');
        const instructionsRect = instructionsContent.getBoundingClientRect();
        
        // If user has scrolled through most of the instructions
        if (instructionsRect.bottom <= window.innerHeight + 100) {
            scrollNotice.style.opacity = '0.5';
            scrollNotice.innerHTML = '<i class="fas fa-check-circle"></i> All instructions read - You may now start the exam';
            scrollNotice.style.color = 'var(--success-color)';
        } else {
            scrollNotice.style.opacity = '1';
            scrollNotice.innerHTML = '<i class="fas fa-mouse-pointer"></i> Please read all instructions above before starting the exam';
            scrollNotice.style.color = 'var(--text-muted)';
        }
    }
}

// Start exam function
function startExam() {
    const startExamBtn = document.getElementById('startExamBtn');
    const originalText = startExamBtn.innerHTML;
    
    // Show loading state
    startExamBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing Exam...';
    startExamBtn.disabled = true;
    
    // Get module ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module') || '1';
    
    // Save exam start time (in a real app, this would be sent to backend)
    const examData = {
        moduleId: moduleId,
        startTime: Date.now(),
        attempted: 0,
        total: document.getElementById('totalQuestions').textContent
    };
    
    localStorage.setItem(`exam_progress_${moduleId}`, JSON.stringify(examData));
    
    // Simulate loading delay
    setTimeout(() => {
        // Redirect to exam page
        alert('Exam is starting... Good luck!');
        
        window.location.href = `exam.html?module=${moduleId}`;
        
        // For demo purposes, we'll just reset the button
        startExamBtn.innerHTML = originalText;
        startExamBtn.disabled = false;
        
        console.log('Redirecting to exam page for module:', moduleId);
    }, 2000);
}

// Add some visual effects
document.addEventListener('DOMContentLoaded', function() {
    // Add pulse animation to start button when enabled
    const startExamBtn = document.getElementById('startExamBtn');
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    
    agreeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            startExamBtn.classList.add('pulse');
        } else {
            startExamBtn.classList.remove('pulse');
        }
    });
    
    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(110, 68, 255, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(110, 68, 255, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(110, 68, 255, 0);
            }
        }
    `;
    document.head.appendChild(style);
});