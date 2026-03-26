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

// Global variables
let selectedFile = null;
let previewQuestionsList = [];

document.addEventListener('DOMContentLoaded', function() {
    if (typeof createParticles === 'function') {
        createParticles();
    }
    hidePreloader();
    
    // Check authentication
    checkAuth();
});

// Check if user is authenticated
function checkAuth() {
    const accessToken = CookieManager.get('access_token');
    if (!accessToken) {
        window.location.href = '/exam_frontend/core/auth.html';
    }
}

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

    // Store the selected file
    selectedFile = file;
    
    // Update file info
    updateFileInfo(file);
    
    // Show file preview prompt
    showInfo('File selected. Please fill in exam details below and preview the questions.');
    
    // Show exam details form
    showExamDetailsForm();
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

// Show Exam Details Form
function showExamDetailsForm() {
    // Create form HTML if not exists
    let examDetailsForm = document.getElementById('examDetailsForm');
    if (!examDetailsForm) {
        examDetailsForm = document.createElement('div');
        examDetailsForm.id = 'examDetailsForm';
        examDetailsForm.className = 'exam-details-form';
        examDetailsForm.innerHTML = `
            <h3>Exam Details</h3>
            <form id="examForm">
                <div class="form-group">
                    <label for="examTitle">Exam Title *</label>
                    <input type="text" id="examTitle" required placeholder="e.g., Mathematics Grade 10">
                </div>
                
                <div class="form-group">
                    <label for="examCode">Exam Code *</label>
                    <input type="text" id="examCode" required placeholder="e.g., MATH101">
                </div>
                
                <div class="form-group">
                    <label for="examLevel">Academic Level *</label>
                    <select id="examLevel" required>
                        <option value="">Loading levels...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="examDescription">Description</label>
                    <textarea id="examDescription" rows="3" placeholder="Optional exam description"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="examDuration">Duration (minutes) *</label>
                        <input type="number" id="examDuration" value="60" min="1" max="300" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="passingScore">Passing Score (%) *</label>
                        <input type="number" id="passingScore" value="60" min="0" max="100" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="maxAttempts">Max Attempts *</label>
                        <input type="number" id="maxAttempts" value="1" min="1" max="10" required>
                    </div>
                </div>
                
                <div class="form-checkboxes">
                    <label>
                        <input type="checkbox" id="randomizeQuestions" checked>
                        Randomize question order for each student
                    </label>
                    
                    <label>
                        <input type="checkbox" id="showCorrectAnswers" checked>
                        Show correct answers after exam completion
                    </label>
                    
                    <label>
                        <input type="checkbox" id="isActive">
                        Activate exam immediately (students can take it right away)
                    </label>
                </div>
                
                <button type="button" class="btn btn-primary" id="previewBtn">
                    <i class="fas fa-eye"></i> Preview Questions
                </button>
            </form>
        `;
        
        // Insert after file info
        fileInfo.parentNode.insertBefore(examDetailsForm, fileInfo.nextSibling);
    }
    
    examDetailsForm.classList.add('show');
    
    // Load levels
    loadLevels();
    
    // Add preview button listener
    document.getElementById('previewBtn').addEventListener('click', previewQuestions);
}

// Load Academic Levels
async function loadLevels() {
    try {
        const accessToken = CookieManager.get('access_token');
        const response = await fetch(`${CORE_URL}/levels/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            const levelSelect = document.getElementById('examLevel');
            levelSelect.innerHTML = '<option value="">Select a level</option>';
            
            result.data.forEach(level => {
                const option = document.createElement('option');
                option.value = level.id;
                option.textContent = `${level.name} (${level.level_type})`;
                levelSelect.appendChild(option);
            });
        } else {
            showError('Failed to load academic levels');
        }
    } catch (error) {
        console.error('Error loading levels:', error);
        showError('Error loading academic levels');
    }
}

// Preview Questions (validate form and show preview)
async function previewQuestions() {
    // Validate form
    const examTitle = document.getElementById('examTitle').value.trim();
    const examCode = document.getElementById('examCode').value.trim();
    const examLevel = document.getElementById('examLevel').value;
    
    if (!examTitle || !examCode || !examLevel) {
        showError('Please fill in all required fields (Title, Code, and Level)');
        return;
    }
    
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }
    
    // Show progress
    showProgress();
    progressText.textContent = 'Reading and validating questions...';
    
    try {
        // Read and parse the file
        const questions = await parseExcelFile(selectedFile);
        
        hideProgress();
        
        if (questions && questions.length > 0) {
            previewQuestionsList = questions;
            displayPreviewQuestions(questions);
            previewSection.classList.add('show');
            showSuccess(`Successfully loaded ${questions.length} questions from file!`);
        } else {
            showError('No valid questions found in the file. Please check the file format.');
        }
    } catch (error) {
        hideProgress();
        console.error('Error parsing file:', error);
        showError('Error reading file: ' + error.message);
    }
}

// Parse Excel/CSV File
async function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                let questions = [];
                
                if (fileExtension === 'csv') {
                    // Parse CSV
                    questions = parseCSV(data);
                } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                    // Parse Excel using SheetJS
                    questions = parseExcel(data);
                }
                
                resolve(questions);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        if (fileExtension === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

// Parse Excel Data using SheetJS
function parseExcel(data) {
    try {
        // Check if XLSX library is loaded
        if (typeof XLSX === 'undefined') {
            throw new Error('Excel parser library not loaded. Please refresh the page.');
        }
        
        // Read the workbook
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (jsonData.length === 0) {
            throw new Error('No data found in Excel file');
        }
        
        // Normalize column names (lowercase and trim)
        const questions = jsonData.map(row => {
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
                normalizedRow[normalizedKey] = row[key];
            });
            return normalizedRow;
        });
        
        // Validate required columns
        const requiredCols = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
        const firstRow = questions[0] || {};
        const missingCols = requiredCols.filter(col => !(col in firstRow));
        
        if (missingCols.length > 0) {
            throw new Error(`Missing required columns: ${missingCols.join(', ')}`);
        }
        
        // Filter valid questions
        const validQuestions = questions.filter(q => 
            q.question_text && 
            q.option_a && 
            q.option_b && 
            q.option_c && 
            q.option_d && 
            q.correct_answer
        );
        
        if (validQuestions.length === 0) {
            throw new Error('No valid questions found. Please ensure all required fields are filled.');
        }
        
        return validQuestions;
    } catch (error) {
        throw new Error(`Excel parsing error: ${error.message}`);
    }
}

// Parse CSV Data
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Required columns
    const requiredCols = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
    const missingCols = requiredCols.filter(col => !headers.includes(col));
    
    if (missingCols.length > 0) {
        throw new Error(`Missing required columns: ${missingCols.join(', ')}`);
    }
    
    // Parse rows
    const questions = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;
        
        const question = {};
        headers.forEach((header, index) => {
            question[header] = values[index] || '';
        });
        
        // Validate required fields
        if (question.question_text && question.option_a && question.option_b && 
            question.option_c && question.option_d && question.correct_answer) {
            questions.push(question);
        }
    }
    
    return questions;
}

// Parse CSV Line (handles quoted fields)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

// Display Preview Questions
function displayPreviewQuestions(questions) {
    previewTableBody.innerHTML = '';
    
    if (!questions || questions.length === 0) {
        previewTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    No questions to display
                </td>
            </tr>
        `;
        questionCount.textContent = '0';
        return;
    }
    
    questions.forEach((q, index) => {
        const row = document.createElement('tr');
        const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(opt => opt).join(', ');
        const correctAnswer = q.correct_answer ? q.correct_answer.toUpperCase() : '-';
        const difficulty = q.difficulty || 'medium';
        const category = q.category || 'General';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${q.question_text.substring(0, 100)}${q.question_text.length > 100 ? '...' : ''}</td>
            <td style="font-size: 0.85rem;">${options.substring(0, 50)}${options.length > 50 ? '...' : ''}</td>
            <td><strong style="color: var(--primary-color);">${correctAnswer}</strong></td>
            <td><span class="file-type-badge">${difficulty}</span></td>
            <td>${category}</td>
        `;
        previewTableBody.appendChild(row);
    });
    
    questionCount.textContent = questions.length;
}

// Submit Exam to Backend
async function submitExam() {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }
    
    // Get form values
    const examTitle = document.getElementById('examTitle')?.value.trim();
    const examCode = document.getElementById('examCode')?.value.trim();
    const examLevel = document.getElementById('examLevel')?.value;
    const examDescription = document.getElementById('examDescription')?.value.trim() || '';
    const examDuration = document.getElementById('examDuration')?.value || 60;
    const passingScore = document.getElementById('passingScore')?.value || 60;
    const maxAttempts = document.getElementById('maxAttempts')?.value || 1;
    const randomizeQuestions = document.getElementById('randomizeQuestions')?.checked || false;
    const showCorrectAnswers = document.getElementById('showCorrectAnswers')?.checked || false;
    const isActive = document.getElementById('isActive')?.checked || false;
    
    // Validate required fields
    if (!examTitle || !examCode || !examLevel) {
        showError('Please fill in all required fields (Title, Code, and Level)');
        return;
    }
    
    showProgress();
    progressText.textContent = 'Uploading and creating exam...';
    
    try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', examTitle);
        formData.append('code', examCode);
        formData.append('level_id', examLevel);
        formData.append('description', examDescription);
        formData.append('duration_minutes', examDuration);
        formData.append('passing_score', passingScore);
        formData.append('max_attempts', maxAttempts);
        formData.append('randomize_questions', randomizeQuestions);
        formData.append('show_correct_answers', showCorrectAnswers);
        formData.append('is_active', isActive);
        
        // Get access token
        const accessToken = CookieManager.get('access_token');
        
        // Send request to backend
        const response = await fetch(`${CORE_URL}/exams/create/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        hideProgress();
        
        if (response.ok && result.success) {
            const examData = result.data.exam_module;
            const questionsData = result.data.questions;
            const uploadData = result.data.bulk_upload;
            
            // Show success message with details
            let successMsg = `Exam "${examData.title}" created successfully with ${examData.total_questions} questions!`;
            
            if (uploadData.failed_records > 0) {
                successMsg += ` Note: ${uploadData.failed_records} questions failed validation.`;
            }
            
            showSuccess(successMsg);
            
            // Display actual questions in preview
            displayCreatedQuestions(questionsData);
            
            // Reset form after 3 seconds
            setTimeout(() => {
                resetForm();
                // Redirect to dashboard or exam list
                // window.location.href = '/exam_frontend/core/admin-dashboard.html';
            }, 3000);
        } else {
            showError(result.message || 'Failed to create exam. Please check your file format and try again.');
        }
    } catch (error) {
        hideProgress();
        console.error('Error creating exam:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

// Display Created Questions
function displayCreatedQuestions(questions) {
    previewTableBody.innerHTML = '';
    
    if (!questions || questions.length === 0) {
        previewTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    No questions to display
                </td>
            </tr>
        `;
        return;
    }
    
    questions.forEach((q, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${q.question_text}</td>
            <td>-</td>
            <td>-</td>
            <td><span class="file-type-badge">${q.difficulty}</span></td>
            <td>${q.category || 'General'}</td>
        `;
        previewTableBody.appendChild(row);
    });
    
    questionCount.textContent = questions.length;
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

// Show Info Message
function showInfo(message) {
    // You can create a new info message element or reuse success
    successText.textContent = message;
    successMessage.classList.add('show');
    errorMessage.classList.remove('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Reset Form
function resetForm() {
    fileInput.value = '';
    selectedFile = null;
    fileInfo.classList.remove('show');
    previewSection.classList.remove('show');
    successMessage.classList.remove('show');
    errorMessage.classList.remove('show');
    uploadSection.classList.remove('active');
    
    // Reset exam details form
    const examDetailsForm = document.getElementById('examDetailsForm');
    if (examDetailsForm) {
        examDetailsForm.remove();
    }
}
