// Mock data for modules
const modules = [
    {
        id: 1,
        title: "Mathematics",
        description: "Practice algebra, geometry, calculus, and advanced mathematical concepts",
        icon: "fas fa-calculator",
        iconColor: "linear-gradient(135deg, #6e44ff 0%, #00c9ff 100%)",
        questions: 25,
        duration: "30-45 min",
        difficulty: "medium",
        lastUpdated: "2024-01-20"
    },
    {
        id: 2,
        title: "Physics",
        description: "Test your knowledge of mechanics, thermodynamics, electromagnetism, and modern physics",
        icon: "fas fa-atom",
        iconColor: "linear-gradient(135deg, #ff2e63 0%, #ff8a00 100%)",
        questions: 20,
        duration: "25-40 min",
        difficulty: "hard",
        lastUpdated: "2024-01-19"
    },
    {
        id: 3,
        title: "Computer Science",
        description: "Programming fundamentals, algorithms, data structures, and software engineering concepts",
        icon: "fas fa-code",
        iconColor: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)",
        questions: 30,
        duration: "35-50 min",
        difficulty: "medium",
        lastUpdated: "2024-01-21"
    },
    {
        id: 4,
        title: "Biology",
        description: "Cell biology, genetics, evolution, ecology, and human anatomy concepts",
        icon: "fas fa-microscope",
        iconColor: "linear-gradient(135deg, #ff8a00 0%, #e52e71 100%)",
        questions: 22,
        duration: "28-42 min",
        difficulty: "medium",
        lastUpdated: "2024-01-18"
    },
    {
        id: 5,
        title: "Chemistry",
        description: "Organic chemistry, inorganic chemistry, biochemistry, and chemical reactions",
        icon: "fas fa-flask",
        iconColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        questions: 18,
        duration: "22-35 min",
        difficulty: "hard",
        lastUpdated: "2024-01-22"
    },
    {
        id: 6,
        title: "English Language",
        description: "Grammar, vocabulary, comprehension, and writing skills practice",
        icon: "fas fa-book",
        iconColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        questions: 35,
        duration: "40-60 min",
        difficulty: "easy",
        lastUpdated: "2024-01-17"
    }
];

// DOM Elements
const nameModal = document.getElementById('nameModal');
const userNameInput = document.getElementById('userName');
const saveNameBtn = document.getElementById('saveNameBtn');
const welcomeBanner = document.getElementById('welcomeBanner');
const displayUserName = document.getElementById('displayUserName');
const editNameBtn = document.getElementById('editNameBtn');
const modulesGrid = document.getElementById('modulesGrid');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadModules();
    checkUserName();
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
    });

// Setup event listeners
function setupEventListeners() {
    saveNameBtn.addEventListener('click', saveUserName);
    editNameBtn.addEventListener('click', openNameModal);
    
    // Allow Enter key to save name
    userNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveUserName();
        }
    });
}

// Check if user name exists
function checkUserName() {
    const savedName = localStorage.getItem('quizUserName');
    
    if (savedName) {
        // Show welcome banner with saved name
        displayUserName.textContent = savedName;
        welcomeBanner.style.display = 'block';
        nameModal.classList.remove('active');
    } else {
        // Show name modal if no name is saved
        nameModal.classList.add('active');
    }
}

// Save user name
function saveUserName() {
    const userName = userNameInput.value.trim();
    
    if (!userName) {
        showError('Please enter your name to continue.');
        userNameInput.focus();
        return;
    }

    // Save to localStorage
    localStorage.setItem('quizUserName', userName);
    
    // Update display
    displayUserName.textContent = userName;
    welcomeBanner.style.display = 'block';
    
    // Close modal
    nameModal.classList.remove('active');
    
    showSuccess(`Welcome, ${userName}! Ready to start practicing?`);
}

// Open name modal for editing
function openNameModal() {
    const currentName = localStorage.getItem('quizUserName');
    if (currentName) {
        userNameInput.value = currentName;
    }
    nameModal.classList.add('active');
    userNameInput.focus();
}

// Load modules into grid
function loadModules() {
    modulesGrid.innerHTML = '';
    
    modules.forEach(module => {
        const moduleCard = document.createElement('a');
        moduleCard.className = 'module-card';
        moduleCard.href = `exam-instructions.html?module=${module.id}`;
        
        // Determine difficulty class and text
        let difficultyClass = 'difficulty-easy';
        let difficultyText = 'Easy';
        
        if (module.difficulty === 'medium') {
            difficultyClass = 'difficulty-medium';
            difficultyText = 'Medium';
        } else if (module.difficulty === 'hard') {
            difficultyClass = 'difficulty-hard';
            difficultyText = 'Hard';
        }
        
        moduleCard.innerHTML = `
            <div class="module-header">
                <div style="display: flex; align-items: flex-start;">
                    <div class="module-icon" style="background: ${module.iconColor};">
                        <i class="${module.icon}"></i>
                    </div>
                    <div class="module-info">
                        <h3 class="module-title">${module.title}</h3>
                        <p class="module-description">${module.description}</p>
                    </div>
                </div>
            </div>
            
            <div class="module-stats">
                <div class="stat-item">
                    <div class="stat-value">${module.questions}</div>
                    <div class="stat-label">Questions</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${module.duration}</div>
                    <div class="stat-label">Duration</div>
                </div>
            </div>
            
            <div class="module-footer">
                <div>
                    <span class="difficulty ${difficultyClass}">${difficultyText}</span>
                </div>
                <button class="start-btn">
                    <i class="fas fa-play-circle"></i> Start Practice
                </button>
            </div>
            
            <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                Updated: ${formatDate(module.lastUpdated)}
            </div>
        `;
        modulesGrid.appendChild(moduleCard);
    });
}

// Show success message (you can implement this similarly to previous pages)
function showSuccess(message) {
    // Create a temporary success message
    const tempMessage = document.createElement('div');
    tempMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(40, 167, 69, 0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;
    tempMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(tempMessage);
    
    setTimeout(() => {
        tempMessage.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    // Create a temporary error message
    const tempMessage = document.createElement('div');
    tempMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(220, 53, 69, 0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;
    tempMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(tempMessage);
    
    setTimeout(() => {
        tempMessage.remove();
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
