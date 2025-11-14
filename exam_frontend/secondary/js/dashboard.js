// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get student data (in real app, this would come from backend)
    const studentData = getStudentData();
    
    // Populate student information
    populateStudentInfo(studentData);
    
    // Load modules
    loadModules(studentData.level);
    
    // Show confirmation modal
    showConfirmationModal(studentData);
    
    // Setup event listeners
    setupEventListeners();
    
    // Create particles
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Get student data (simulated - in real app, this would come from backend/API)
function getStudentData() {
    return {
        id: 'S12345',
        name: 'John Doe',
        level: 'Secondary 2',
        institution: 'SmartExams Academy',
        modules: [
            {
                id: 1,
                name: 'Mathematics',
                icon: 'calculator',
                description: 'Algebra, Geometry, Calculus and advanced mathematical concepts',
                progress: 75,
                assignments: 12,
                topics: 8,
                topicsList: [
                    { name: 'Algebra Basics', status: 'completed', description: 'Linear equations and inequalities' },
                    { name: 'Quadratic Equations', status: 'completed', description: 'Solving quadratic equations' },
                    { name: 'Functions', status: 'in-progress', description: 'Understanding functions and graphs' },
                    { name: 'Geometry', status: 'not-started', description: 'Shapes, angles, and theorems' },
                    { name: 'Trigonometry', status: 'not-started', description: 'Triangles and trigonometric functions' },
                    { name: 'Calculus Basics', status: 'not-started', description: 'Introduction to derivatives' },
                    { name: 'Statistics', status: 'not-started', description: 'Data analysis and probability' },
                    { name: 'Advanced Algebra', status: 'not-started', description: 'Polynomials and complex numbers' }
                ],
                resources: [
                    { name: 'Textbook Chapter 1-3', type: 'PDF', icon: 'file-pdf' },
                    { name: 'Video Lectures', type: 'Videos (5)', icon: 'video' },
                    { name: 'Practice Problems', type: 'Worksheet', icon: 'edit' },
                    { name: 'Formula Sheet', type: 'Reference', icon: 'clipboard-list' }
                ]
            },
            {
                id: 2,
                name: 'Physics',
                icon: 'atom',
                description: 'Mechanics, Thermodynamics, Electromagnetism and Modern Physics',
                progress: 60,
                assignments: 8,
                topics: 6,
                topicsList: [
                    { name: 'Mechanics', status: 'completed', description: 'Motion, forces, and energy' },
                    { name: 'Thermodynamics', status: 'in-progress', description: 'Heat and temperature' },
                    { name: 'Waves', status: 'not-started', description: 'Sound and light waves' },
                    { name: 'Electricity', status: 'not-started', description: 'Circuits and electrical fields' },
                    { name: 'Magnetism', status: 'not-started', description: 'Magnetic fields and forces' },
                    { name: 'Modern Physics', status: 'not-started', description: 'Quantum and relativity' }
                ],
                resources: [
                    { name: 'Physics Textbook', type: 'PDF', icon: 'file-pdf' },
                    { name: 'Lab Manual', type: 'Guide', icon: 'flask' },
                    { name: 'Simulation Tools', type: 'Interactive', icon: 'laptop-code' }
                ]
            },
            {
                id: 3,
                name: 'Chemistry',
                icon: 'flask',
                description: 'Organic, Inorganic, Physical Chemistry and Laboratory techniques',
                progress: 45,
                assignments: 10,
                topics: 7,
                topicsList: [
                    { name: 'Atomic Structure', status: 'completed', description: 'Atoms and periodic table' },
                    { name: 'Chemical Bonds', status: 'in-progress', description: 'Ionic and covalent bonding' },
                    { name: 'Reactions', status: 'not-started', description: 'Chemical equations' },
                    { name: 'Stoichiometry', status: 'not-started', description: 'Calculations in chemistry' },
                    { name: 'Organic Chemistry', status: 'not-started', description: 'Carbon compounds' },
                    { name: 'Acids and Bases', status: 'not-started', description: 'pH and reactions' },
                    { name: 'Laboratory Safety', status: 'not-started', description: 'Lab procedures and safety' }
                ],
                resources: [
                    { name: 'Chemistry Textbook', type: 'PDF', icon: 'file-pdf' },
                    { name: 'Periodic Table', type: 'Reference', icon: 'table' },
                    { name: 'Lab Videos', type: 'Videos (3)', icon: 'video' }
                ]
            },
            {
                id: 4,
                name: 'Biology',
                icon: 'dna',
                description: 'Cell Biology, Genetics, Ecology and Human Anatomy',
                progress: 80,
                assignments: 6,
                topics: 5,
                topicsList: [
                    { name: 'Cell Structure', status: 'completed', description: 'Organelles and functions' },
                    { name: 'Genetics', status: 'completed', description: 'DNA and inheritance' },
                    { name: 'Evolution', status: 'in-progress', description: 'Natural selection' },
                    { name: 'Ecology', status: 'not-started', description: 'Ecosystems and interactions' },
                    { name: 'Human Anatomy', status: 'not-started', description: 'Body systems and functions' }
                ],
                resources: [
                    { name: 'Biology Textbook', type: 'PDF', icon: 'file-pdf' },
                    { name: 'Anatomy Charts', type: 'Diagrams', icon: 'images' },
                    { name: 'Microscope Guide', type: 'Tutorial', icon: 'microscope' }
                ]
            },
            {
                id: 5,
                name: 'English Language',
                icon: 'language',
                description: 'Grammar, Composition, Literature and Communication skills',
                progress: 90,
                assignments: 15,
                topics: 6,
                topicsList: [
                    { name: 'Grammar', status: 'completed', description: 'Sentence structure and rules' },
                    { name: 'Vocabulary', status: 'completed', description: 'Word usage and meaning' },
                    { name: 'Composition', status: 'completed', description: 'Essay writing techniques' },
                    { name: 'Literature', status: 'in-progress', description: 'Literary analysis' },
                    { name: 'Speaking Skills', status: 'not-started', description: 'Presentation and debate' },
                    { name: 'Critical Reading', status: 'not-started', description: 'Analysis and interpretation' }
                ],
                resources: [
                    { name: 'Grammar Guide', type: 'PDF', icon: 'file-pdf' },
                    { name: 'Literature Books', type: 'Reading List', icon: 'book' },
                    { name: 'Writing Samples', type: 'Examples', icon: 'pen-fancy' }
                ]
            },
            {
                id: 6,
                name: 'Computer Science',
                icon: 'laptop-code',
                description: 'Programming, Algorithms, Data Structures and Web Development',
                progress: 70,
                assignments: 9,
                topics: 7,
                topicsList: [
                    { name: 'Programming Basics', status: 'completed', description: 'Variables and control structures' },
                    { name: 'Data Structures', status: 'in-progress', description: 'Arrays, lists, and trees' },
                    { name: 'Algorithms', status: 'in-progress', description: 'Sorting and searching' },
                    { name: 'Web Development', status: 'not-started', description: 'HTML, CSS, and JavaScript' },
                    { name: 'Databases', status: 'not-started', description: 'SQL and data modeling' },
                    { name: 'Software Engineering', status: 'not-started', description: 'Development methodologies' },
                    { name: 'Project', status: 'not-started', description: 'Final capstone project' }
                ],
                resources: [
                    { name: 'Programming Guide', type: 'PDF', icon: 'file-pdf' },
                    { name: 'Code Examples', type: 'Templates', icon: 'code' },
                    { name: 'Development Tools', type: 'Software', icon: 'tools' }
                ]
            }
        ]
    };
}

// Populate student information in the dashboard
function populateStudentInfo(data) {
    document.getElementById('studentName').textContent = data.name;
    document.getElementById('studentIdDisplay').textContent = data.id;
    document.getElementById('studentLevel').textContent = data.level;
    
    // Modal information
    document.getElementById('modalStudentName').textContent = data.name;
    document.getElementById('modalStudentId').textContent = data.id;
    document.getElementById('modalStudentLevel').textContent = data.level;
    document.getElementById('modalInstitution').textContent = data.institution;
}

// Load modules based on student level
function loadModules(level) {
    const modulesGrid = document.getElementById('modulesGrid');
    const studentData = getStudentData();
    
    modulesGrid.innerHTML = '';
    
    studentData.modules.forEach(module => {
        const moduleCard = createModuleCard(module);
        modulesGrid.appendChild(moduleCard);
    });
}

// Create module card element
function createModuleCard(module) {
    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = `
        <div class="module-header">
            <div class="module-icon">
                <i class="fas fa-${module.icon}"></i>
            </div>
            <h3 class="module-title">${module.name}</h3>
        </div>
        <p class="module-description">${module.description}</p>
        <div class="module-stats">
            <div class="stat">
                <span class="stat-value">${module.progress}%</span>
                <span class="stat-label">Progress</span>
            </div>
            <div class="stat">
                <span class="stat-value">${module.assignments}</span>
                <span class="stat-label">Assignments</span>
            </div>
        </div>
        <div class="module-actions">
            <button class="btn-module btn-secondary" onclick="viewModule(${module.id})">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn-module btn-primary" onclick="startModule(${module.id})">
                <i class="fas fa-play"></i> Start
            </button>
        </div>
    `;
    
    return card;
}

// Show confirmation modal
function showConfirmationModal(studentData) {
    const modal = document.getElementById('infoModal');
    modal.style.display = 'flex';
    
    // Add animation
    setTimeout(() => {
        modal.querySelector('.modal').style.transform = 'scale(1)';
        modal.querySelector('.modal').style.opacity = '1';
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    const modal = document.getElementById('infoModal');
    const confirmBtn = document.getElementById('confirmBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const modalClose = document.getElementById('modalClose');
    
    // Module modal elements
    const moduleModal = document.getElementById('moduleModal');
    const moduleModalClose = document.getElementById('moduleModalClose');
    const closeModuleModalBtn = document.getElementById('closeModuleModal');
    const startModuleFromModalBtn = document.getElementById('startModuleFromModal');
    
    // Confirm button - close modal
    confirmBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // Logout button - redirect to login
    logoutBtn.addEventListener('click', function() {
        logout();
    });
    
    // Close modal button
    modalClose.addEventListener('click', function() {
        closeModal();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Module modal close events
    moduleModalClose.addEventListener('click', function() {
        closeModuleModal();
    });
    
    closeModuleModalBtn.addEventListener('click', function() {
        closeModuleModal();
    });
    
    // Close module modal when clicking outside
    moduleModal.addEventListener('click', function(e) {
        if (e.target === moduleModal) {
            closeModuleModal();
        }
    });
    
    // Start module from modal button
    startModuleFromModalBtn.addEventListener('click', function() {
        const moduleId = this.getAttribute('data-module-id');
        if (moduleId) {
            startModule(parseInt(moduleId));
            closeModuleModal();
        }
    });
}

// Close modal with animation
function closeModal() {
    const modal = document.getElementById('infoModal');
    const modalContent = modal.querySelector('.modal');
    
    modalContent.style.transform = 'scale(0.9)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Close module modal with animation
function closeModuleModal() {
    const modal = document.getElementById('moduleModal');
    const modalContent = modal.querySelector('.modal');
    
    modalContent.style.transform = 'scale(0.9)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Logout function
function logout() {
    // Show loading state
    const logoutBtn = document.getElementById('logoutBtn');
    const originalText = logoutBtn.innerHTML;
    logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    logoutBtn.disabled = true;
    
    setTimeout(() => {
        alert('You have been logged out successfully.');
        window.location.href = 'auth.html';
    }, 1000);
}

// Module actions
function viewModule(moduleId) {
    const studentData = getStudentData();
    const module = studentData.modules.find(m => m.id === moduleId);
    
    if (module) {
        showModuleModal(module);
    }
}

function startModule(moduleId) {
    // In real app, redirect to module exam/lesson page
    alert(`Starting module ID: ${moduleId}`);
    window.location.href = `exam-instruction.html?module=${moduleId}`;
}

// Show module details modal
function showModuleModal(module) {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('moduleModalTitle');
    const modalIcon = document.getElementById('moduleModalIcon');
    const modalName = document.getElementById('moduleModalName');
    const modalDescription = document.getElementById('moduleModalDescription');
    const modalProgress = document.getElementById('moduleModalProgress');
    const modalAssignments = document.getElementById('moduleModalAssignments');
    const modalTopics = document.getElementById('moduleModalTopics');
    const topicsList = document.getElementById('topicsList');
    const resourcesList = document.getElementById('resourcesList');
    const startModuleBtn = document.getElementById('startModuleFromModal');
    
    // Set module data
    modalTitle.textContent = `${module.name} - Module Details`;
    modalIcon.className = `fas fa-${module.icon}`;
    modalName.textContent = module.name;
    modalDescription.textContent = module.description;
    modalProgress.textContent = `${module.progress}%`;
    modalAssignments.textContent = module.assignments;
    modalTopics.textContent = module.topics;
    
    // Set module ID for start button
    startModuleBtn.setAttribute('data-module-id', module.id);
    
    // Populate topics
    topicsList.innerHTML = '';
    module.topicsList.forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        
        let statusIcon = 'fa-circle';
        let statusClass = 'topic-not-started';
        
        if (topic.status === 'completed') {
            statusIcon = 'fa-check';
            statusClass = 'topic-completed';
        } else if (topic.status === 'in-progress') {
            statusIcon = 'fa-sync-alt';
            statusClass = 'topic-in-progress';
        }
        
        topicItem.innerHTML = `
            <div class="topic-status ${statusClass}">
                <i class="fas ${statusIcon}"></i>
            </div>
            <div class="topic-info">
                <div class="topic-name">${topic.name}</div>
                <div class="topic-description">${topic.description}</div>
            </div>
        `;
        
        topicsList.appendChild(topicItem);
    });
    
    // Populate resources
    resourcesList.innerHTML = '';
    module.resources.forEach(resource => {
        const resourceItem = document.createElement('a');
        resourceItem.className = 'resource-item';
        resourceItem.href = '#'; // In real app, this would link to the resource
        
        resourceItem.innerHTML = `
            <div class="resource-icon">
                <i class="fas fa-${resource.icon}"></i>
            </div>
            <div class="resource-info">
                <div class="resource-name">${resource.name}</div>
                <div class="resource-type">${resource.type}</div>
            </div>
        `;
        
        resourcesList.appendChild(resourceItem);
    });
    
    // Show modal
    modal.style.display = 'flex';
    
    // Add animation
    setTimeout(() => {
        modal.querySelector('.modal').style.transform = 'scale(1)';
        modal.querySelector('.modal').style.opacity = '1';
    }, 100);
}