// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileInfo = document.getElementById('fileInfo');
const previewSection = document.getElementById('previewSection');
const previewTableBody = document.getElementById('previewTableBody');
const questionCount = document.getElementById('questionCount');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const successText = document.getElementById('successText');
const errorText = document.getElementById('errorText');

// File info elements
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileType = document.getElementById('fileType');
const fileModified = document.getElementById('fileModified');

document.addEventListener('DOMContentLoaded', function() {

    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Event Listeners
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
submitBtn.addEventListener('click', submitExam);
cancelBtn.addEventListener('click', resetForm);

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadSection.classList.add('active');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadSection.classList.remove('active');
}

function handleDrop(e) {
    e.preventDefault();
    uploadSection.classList.remove('active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect({ target: fileInput });
    }
}

// File Selection Handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
                        ['xlsx', 'xls', 'csv'].includes(fileExtension);

    if (!isValidType) {
        showError('Please select a valid Excel or CSV file.');
        return;
    }

    // Update file info
    updateFileInfo(file);
    
    // Show progress and process file
    showProgress();
    processFile(file);
}

// Update File Information
function updateFileInfo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileType.textContent = file.type || `*.${file.name.split('.').pop()}`;
    fileModified.textContent = new Date(file.lastModified).toLocaleString();
    fileInfo.classList.add('show');
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show Progress Bar
function showProgress() {
    progressContainer.classList.add('show');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressFill.style.width = progress + '%';
        progressText.textContent = `Processing file... ${Math.round(progress)}%`;
    }, 200);
}

// Hide Progress Bar
function hideProgress() {
    progressContainer.classList.remove('show');
    progressFill.style.width = '0%';
}

// Process File (Simulate backend processing)
function processFile(file) {
    // Simulate API call to backend
    setTimeout(() => {
        hideProgress();
        
        // Mock response from backend (in real scenario, this would come from your API)
        const mockQuestions = generateMockQuestions();
        
        // Display preview
        displayPreview(mockQuestions);
        previewSection.classList.add('show');
        
    }, 2000);
}

// Generate Mock Questions (Replace with actual backend response)
function generateMockQuestions() {
    return [
        {
            id: 1,
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: "Paris",
            difficulty: "Easy",
            category: "Geography"
        },
        {
            id: 2,
            question: "Which programming language is known for web development?",
            options: ["Python", "Java", "JavaScript", "C++"],
            correctAnswer: "JavaScript",
            difficulty: "Medium",
            category: "Programming"
        },
        {
            id: 3,
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "4",
            difficulty: "Easy",
            category: "Mathematics"
        },
        {
            id: 4,
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            correctAnswer: "Mars",
            difficulty: "Easy",
            category: "Science"
        },
        {
            id: 5,
            question: "What does HTML stand for?",
            options: [
                "Hyper Text Markup Language",
                "High Tech Modern Language",
                "Hyper Transfer Markup Language",
                "Home Tool Markup Language"
            ],
            correctAnswer: "Hyper Text Markup Language",
            difficulty: "Medium",
            category: "Web Development"
        }
    ];
}

// Display Preview Table
function displayPreview(questions) {
    previewTableBody.innerHTML = '';
    questions.forEach((q, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${q.question}</td>
            <td>${q.options.join(', ')}</td>
            <td><strong>${q.correctAnswer}</strong></td>
            <td><span class="file-type-badge">${q.difficulty}</span></td>
            <td>${q.category}</td>
        `;
        previewTableBody.appendChild(row);
    });
    questionCount.textContent = questions.length;
}

// Submit Exam to Backend
function submitExam() {
    showProgress();
    progressText.textContent = 'Creating exam...';
    
    // Simulate API call to backend
    setTimeout(() => {
        hideProgress();
        
        // Simulate success (in real scenario, check response from backend)
        const success = Math.random() > 0.2; // 80% success rate for demo
        
        if (success) {
            showSuccess('Exam has been created successfully! You can now manage it from the dashboard.');
            resetForm();
        } else {
            showError('Failed to create exam. Please check your file format and try again.');
        }
    }, 1500);
}

// Show Success Message
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.add('show');
    errorMessage.classList.remove('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Show Error Message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('show');
    successMessage.classList.remove('show');
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Reset Form
function resetForm() {
    fileInput.value = '';
    fileInfo.classList.remove('show');
    previewSection.classList.remove('show');
    successMessage.classList.remove('show');
    errorMessage.classList.remove('show');
    uploadSection.classList.remove('active');
}

// Initialize page
