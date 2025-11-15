// DOM Elements
const agreeCheckbox = document.getElementById('agreeCheckbox');
const startPracticeBtn = document.getElementById('startPracticeBtn');
const examTitle = document.getElementById('examTitle');
const moduleBreadcrumb = document.getElementById('moduleBreadcrumb');
const moduleIcon = document.getElementById('moduleIcon');
const totalQuestions = document.getElementById('totalQuestions');

// Module data (in a real app, this would come from the previous page or API)
const modules = {
    1: { title: "Mathematics", icon: "fas fa-calculator", questions: 25, color: "linear-gradient(135deg, #6e44ff 0%, #00c9ff 100%)" },
    2: { title: "Physics", icon: "fas fa-atom", questions: 20, color: "linear-gradient(135deg, #ff2e63 0%, #ff8a00 100%)" },
    3: { title: "Computer Science", icon: "fas fa-code", questions: 30, color: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)" },
    4: { title: "Biology", icon: "fas fa-microscope", questions: 22, color: "linear-gradient(135deg, #ff8a00 0%, #e52e71 100%)" },
    5: { title: "Chemistry", icon: "fas fa-flask", questions: 18, color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    6: { title: "English Language", icon: "fas fa-book", questions: 35, color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadModuleData();
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Setup event listeners
function setupEventListeners() {
    agreeCheckbox.addEventListener('change', toggleStartButton);
    startPracticeBtn.addEventListener('click', startPracticeSession);
}

// Load module data from URL parameters
function loadModuleData() {
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module');
    
    if (moduleId && modules[moduleId]) {
        const module = modules[moduleId];
        
        // Update page content
        examTitle.textContent = `${module.title} Practice`;
        moduleBreadcrumb.textContent = module.title;
        moduleBreadcrumb.href = `index.html`;
        moduleIcon.className = module.icon;
        totalQuestions.textContent = `${module.questions} Questions`;
        
        // Update icon background color
        document.querySelector('.exam-icon').style.background = module.color;
    } else {
        // Default fallback
        examTitle.textContent = "General Practice";
        moduleBreadcrumb.textContent = "Practice";
    }
}

// Toggle start button based on agreement
function toggleStartButton() {
    startPracticeBtn.disabled = !agreeCheckbox.checked;
}

// Start practice session
function startPracticeSession() {
    if (!agreeCheckbox.checked) return;

    // Show loading state
    startPracticeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Practice...';
    startPracticeBtn.disabled = true;

    // Get current module
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module');

    // Simulate loading and redirect to practice questions page
    setTimeout(() => {
        if (moduleId) {
            window.location.href = `quiz-questions.html?module=${moduleId}`;
        } else {
            window.location.href = `quiz-questions.html`;
        }
    }, 1500);
}
