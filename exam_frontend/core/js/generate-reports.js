// Mock data for modules and results
const modules = [
    {
        id: 1,
        title: "Mathematics - Advanced Algebra",
        description: "Advanced algebraic concepts and problem solving",
        icon: "fas fa-calculator",
        iconColor: "linear-gradient(135deg, #6e44ff 0%, #00c9ff 100%)",
        totalStudents: 45,
        averageGrade: "B+",
        passRate: "89%",
        lastUpdated: "2024-01-20"
    },
    {
        id: 2,
        title: "Physics - Mechanics",
        description: "Fundamental principles of classical mechanics",
        icon: "fas fa-atom",
        iconColor: "linear-gradient(135deg, #ff2e63 0%, #ff8a00 100%)",
        totalStudents: 38,
        averageGrade: "B",
        passRate: "82%",
        lastUpdated: "2024-01-19"
    },
    {
        id: 3,
        title: "Computer Science - Programming",
        description: "Introduction to programming and algorithms",
        icon: "fas fa-code",
        iconColor: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)",
        totalStudents: 52,
        averageGrade: "A-",
        passRate: "94%",
        lastUpdated: "2024-01-21"
    },
    {
        id: 4,
        title: "Biology - Cell Structure",
        description: "Cellular biology and microscopic structures",
        icon: "fas fa-microscope",
        iconColor: "linear-gradient(135deg, #ff8a00 0%, #e52e71 100%)",
        totalStudents: 41,
        averageGrade: "B-",
        passRate: "78%",
        lastUpdated: "2024-01-18"
    },
    {
        id: 5,
        title: "English Literature",
        description: "Classic literature analysis and composition",
        icon: "fas fa-book",
        iconColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        totalStudents: 47,
        averageGrade: "A",
        passRate: "96%",
        lastUpdated: "2024-01-22"
    },
    {
        id: 6,
        title: "Chemistry - Organic",
        description: "Organic compounds and chemical reactions",
        icon: "fas fa-flask",
        iconColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        totalStudents: 36,
        averageGrade: "C+",
        passRate: "72%",
        lastUpdated: "2024-01-17"
    }
];

// Mock student results data
const studentResults = [
    // Mathematics results
    {
        moduleId: 1,
        students: [
            { id: 1, studentId: 'STU001', fullName: 'John Smith', classLevel: 'Grade 10', score: 92, grade: 'A', status: 'Passed' },
            { id: 2, studentId: 'STU002', fullName: 'Sarah Johnson', classLevel: 'Grade 10', score: 88, grade: 'B+', status: 'Passed' },
            { id: 3, studentId: 'STU003', fullName: 'Michael Brown', classLevel: 'Grade 10', score: 95, grade: 'A', status: 'Passed' },
            { id: 4, studentId: 'STU004', fullName: 'Emily Davis', classLevel: 'Grade 10', score: 78, grade: 'C+', status: 'Passed' },
            { id: 5, studentId: 'STU005', fullName: 'David Wilson', classLevel: 'Grade 10', score: 85, grade: 'B', status: 'Passed' },
            { id: 6, studentId: 'STU006', fullName: 'Emma Thompson', classLevel: 'Grade 10', score: 91, grade: 'A-', status: 'Passed' },
            { id: 7, studentId: 'STU007', fullName: 'James Wilson', classLevel: 'Grade 10', score: 82, grade: 'B-', status: 'Passed' },
            { id: 8, studentId: 'STU008', fullName: 'Olivia Martinez', classLevel: 'Grade 10', score: 89, grade: 'B+', status: 'Passed' },
            { id: 9, studentId: 'STU009', fullName: 'William Taylor', classLevel: 'Grade 10', score: 76, grade: 'C', status: 'Passed' },
            { id: 10, studentId: 'STU010', fullName: 'Sophia Anderson', classLevel: 'Grade 10', score: 94, grade: 'A', status: 'Passed' }
        ]
    },
    // Add similar data for other modules...
];

// DOM Elements
const modulesGrid = document.getElementById('modulesGrid');
const resultsModal = document.getElementById('resultsModal');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const successText = document.getElementById('successText');
const errorText = document.getElementById('errorText');

// Results modal elements
const statsTitle = document.getElementById('statsTitle');
const averageGrade = document.getElementById('averageGrade');
const highestGrade = document.getElementById('highestGrade');
const lowestGrade = document.getElementById('lowestGrade');
const passRate = document.getElementById('passRate');
const gradeDistribution = document.getElementById('gradeDistribution');
const resultsTableBody = document.getElementById('resultsTableBody');
const emptyResultsState = document.getElementById('emptyResultsState');

// Pagination elements
const paginationInfo = document.getElementById('paginationInfo');
const firstPageBtn = document.getElementById('firstPageBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const pageNumbers = document.getElementById('pageNumbers');
const nextPageBtn = document.getElementById('nextPageBtn');
const lastPageBtn = document.getElementById('lastPageBtn');

// Pagination variables
let currentPage = 1;
const itemsPerPage = 8;
let currentResults = [];
let currentModuleId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadModules();
    setupEventListeners();
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Setup event listeners
function setupEventListeners() {
    modalClose.addEventListener('click', closeModal);
    
    // Pagination events
    firstPageBtn.addEventListener('click', () => goToPage(1));
    prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    lastPageBtn.addEventListener('click', () => goToPage(Math.ceil(currentResults.length / itemsPerPage)));
}

// Load modules into grid
function loadModules() {
    modulesGrid.innerHTML = '';
    
    modules.forEach(module => {
        const moduleCard = document.createElement('div');
        moduleCard.className = 'module-card';
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
                    <div class="stat-value">${module.totalStudents}</div>
                    <div class="stat-label">Students</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${module.averageGrade}</div>
                    <div class="stat-label">Avg Grade</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${module.passRate}</div>
                    <div class="stat-label">Pass Rate</div>
                </div>
            </div>
            
            <div class="module-actions">
                <button class="btn btn-secondary download-report" data-module-id="${module.id}">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-primary view-results" data-module-id="${module.id}">
                    <i class="fas fa-chart-bar"></i> View Results
                </button>
            </div>
            
            <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                Last updated: ${formatDate(module.lastUpdated)}
            </div>
        `;
        modulesGrid.appendChild(moduleCard);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.download-report').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.currentTarget.getAttribute('data-module-id');
            downloadReport(parseInt(moduleId));
        });
    });

    document.querySelectorAll('.view-results').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.currentTarget.getAttribute('data-module-id');
            viewResults(parseInt(moduleId));
        });
    });
}

// Download report
function downloadReport(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    // Simulate download process
    showSuccess(`Report for "${module.title}" is being downloaded...`);
    
    // In a real application, this would trigger an actual file download
    setTimeout(() => {
        showSuccess(`Report for "${module.title}" downloaded successfully.`);
    }, 1500);
}

// View results
function viewResults(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    currentModuleId = moduleId;
    modalTitle.textContent = `${module.title} - Results`;
    statsTitle.textContent = `${module.title} - Performance Statistics`;

    // Get results for this module (in real app, this would come from backend)
    const moduleResults = studentResults.find(r => r.moduleId === moduleId);
    currentResults = moduleResults ? moduleResults.students : [];

    // Calculate statistics
    calculateStatistics(currentResults);
    
    // Display results table
    renderResultsTable();
    updatePagination();
    
    // Show modal
    resultsModal.classList.add('active');
}

// Calculate statistics
function calculateStatistics(results) {
    if (results.length === 0) {
        averageGrade.textContent = '-';
        highestGrade.textContent = '-';
        lowestGrade.textContent = '-';
        passRate.textContent = '-';
        gradeDistribution.innerHTML = '';
        return;
    }

    // Calculate average score
    const totalScore = results.reduce((sum, student) => sum + student.score, 0);
    const avgScore = totalScore / results.length;
    averageGrade.textContent = `${avgScore.toFixed(1)}%`;

    // Find highest and lowest scores
    const scores = results.map(student => student.score);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    highestGrade.textContent = `${highestScore}%`;
    lowestGrade.textContent = `${lowestScore}%`;

    // Calculate pass rate (assuming 60% is passing)
    const passedStudents = results.filter(student => student.score >= 60).length;
    const passRateValue = (passedStudents / results.length) * 100;
    passRate.textContent = `${passRateValue.toFixed(1)}%`;

    // Calculate grade distribution
    const gradeRanges = [
        { label: 'A (90-100%)', min: 90, max: 100, color: '#28a745' },
        { label: 'B (80-89%)', min: 80, max: 89, color: '#17a2b8' },
        { label: 'C (70-79%)', min: 70, max: 79, color: '#ffc107' },
        { label: 'D (60-69%)', min: 60, max: 69, color: '#fd7e14' },
        { label: 'F (0-59%)', min: 0, max: 59, color: '#dc3545' }
    ];

    gradeDistribution.innerHTML = '';
    gradeRanges.forEach(range => {
        const count = results.filter(student => 
            student.score >= range.min && student.score <= range.max
        ).length;
        
        const percentage = (count / results.length) * 100;
        
        const gradeBar = document.createElement('div');
        gradeBar.className = 'grade-bar';
        gradeBar.innerHTML = `
            <div class="grade-label">${range.label}</div>
            <div class="grade-progress">
                <div class="grade-fill" style="width: ${percentage}%; background: ${range.color};"></div>
            </div>
            <div class="grade-count">${count}</div>
        `;
        gradeDistribution.appendChild(gradeBar);
    });
}

// Render results table
function renderResultsTable() {
    resultsTableBody.innerHTML = '';
    
    if (currentResults.length === 0) {
        emptyResultsState.style.display = 'block';
        resultsTableBody.style.display = 'none';
        return;
    }
    
    emptyResultsState.style.display = 'none';
    resultsTableBody.style.display = 'table-row-group';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, currentResults.length);
    const currentPageResults = currentResults.slice(startIndex, endIndex);

    currentPageResults.forEach(student => {
        const row = document.createElement('tr');
        
        // Determine grade class based on score
        let gradeClass = 'grade-poor';
        if (student.score >= 90) gradeClass = 'grade-excellent';
        else if (student.score >= 80) gradeClass = 'grade-good';
        else if (student.score >= 70) gradeClass = 'grade-average';
        
        row.innerHTML = `
            <td class="student-id">${student.studentId}</td>
            <td>${student.fullName}</td>
            <td>${student.classLevel}</td>
            <td><strong>${student.score}%</strong></td>
            <td><span class="grade ${gradeClass}">${student.grade}</span></td>
            <td>
                <span style="color: ${student.status === 'Passed' ? '#28a745' : '#dc3545'}; 
                        font-weight: 600;">
                    ${student.status}
                </span>
            </td>
        `;
        resultsTableBody.appendChild(row);
    });
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(currentResults.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, currentResults.length);
    
    // Update pagination info
    paginationInfo.textContent = `Showing ${startItem} to ${endItem} of ${currentResults.length} students`;
    
    // Update button states
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    lastPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageBtn);
    }
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(currentResults.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderResultsTable();
    updatePagination();
}

// Close modal
function closeModal() {
    resultsModal.classList.remove('active');
    currentPage = 1;
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

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

