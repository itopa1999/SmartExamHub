// Exam JavaScript

let examData = {};
let currentQuestion = 1;
let userAnswers = {};
let flaggedQuestions = new Set();
let examTimer;
let timeRemaining = 0;
let totalTime = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the exam
    initializeExam();
    
    // Setup event listeners
    setupEventListeners();
    
    // Create particles
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Initialize the exam
function initializeExam() {
    // Get exam data from URL parameters or default data
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module') || '1';
    
    // Load exam data
    loadExamData(moduleId);
    
    // Check for existing progress
    checkExistingProgress(moduleId);
    
    // Start the timer
    startTimer();
    
    // Load the first question
    loadQuestion(currentQuestion);
    
    // Initialize question navigation
    initializeQuestionNavigation();
}

// Load exam data
function loadExamData(moduleId) {
    // In a real app, this would come from an API
    examData = {
        id: moduleId,
        title: 'Mathematics Final Examination',
        subtitle: 'Secondary Education',
        duration: 2 * 60 * 60, // 2 hours in seconds
        totalQuestions: 50,
        questions: generateSampleQuestions(50),
        student: {
            name: 'John Doe',
            id: 'S12345'
        }
    };
    
    // Set initial time
    timeRemaining = examData.duration;
    totalTime = examData.duration;
    
    // Update UI with exam data
    document.getElementById('currentExamTitle').textContent = examData.title;
    document.getElementById('currentExamSubtitle').textContent = examData.subtitle;
    document.getElementById('studentInfo').textContent = `Student: ${examData.student.name} (${examData.student.id})`;
    document.getElementById('examInfo').textContent = `${examData.title} - ${examData.subtitle}`;
    
    // Update progress counts
    updateProgressCounts();
}

// Generate sample questions for demonstration
function generateSampleQuestions(count) {
    const questions = [];
    const questionTypes = ['multiple_choice', 'essay', 'math'];
    
    for (let i = 1; i <= count; i++) {
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        let question = {
            id: i,
            type: type,
            text: `This is question ${i} of the examination. ${getQuestionDescription(type)}`,
            points: Math.floor(Math.random() * 3) + 1, // 1-3 points
            answered: false,
            flagged: false
        };
        
        if (type === 'multiple_choice') {
            question.options = [
                { id: 'A', text: `Option A for question ${i}` },
                { id: 'B', text: `Option B for question ${i}` },
                { id: 'C', text: `Option C for question ${i}` },
                { id: 'D', text: `Option D for question ${i}` }
            ];
        }
        
        questions.push(question);
    }
    
    return questions;
}

function getQuestionDescription(type) {
    switch(type) {
        case 'multiple_choice':
            return 'Please select the correct answer from the options below.';
        case 'essay':
            return 'Please write a detailed answer in the text box provided.';
        case 'math':
            return 'Please show your working and provide the final answer.';
        default:
            return 'Please provide your answer.';
    }
}

// Check for existing progress
function checkExistingProgress(moduleId) {
    const progress = localStorage.getItem(`exam_progress_${moduleId}`);
    
    if (progress) {
        const progressData = JSON.parse(progress);
        
        // Restore user answers
        if (progressData.answers) {
            userAnswers = progressData.answers;
        }
        
        // Restore flagged questions
        if (progressData.flagged) {
            flaggedQuestions = new Set(progressData.flagged);
        }
        
        // Update current question
        if (progressData.currentQuestion) {
            currentQuestion = progressData.currentQuestion;
        }
        
        // Update time remaining
        if (progressData.startTime) {
            const timeElapsed = Math.floor((Date.now() - progressData.startTime) / 1000);
            timeRemaining = Math.max(0, examData.duration - timeElapsed);
        }
        
        // Update question states
        examData.questions.forEach((question, index) => {
            question.answered = userAnswers[index + 1] !== undefined;
            question.flagged = flaggedQuestions.has(index + 1);
        });
        
        updateProgressCounts();
        updateQuestionNavigation();
    }
}

// Start the exam timer
function startTimer() {
    updateTimerDisplay();
    
    examTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Auto-submit when time runs out
        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            autoSubmitExam();
        }
        
        // Save progress every 30 seconds
        if (timeRemaining % 30 === 0) {
            saveProgress();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    const timerDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = timerDisplay;
    
    // Update progress bar
    const progressPercent = (timeRemaining / totalTime) * 100;
    document.getElementById('timerProgress').style.width = `${progressPercent}%`;
    
    // Add warning styles when time is low
    const timerElement = document.getElementById('examTimer');
    timerElement.classList.remove('timer-warning', 'timer-critical');
    
    if (timeRemaining < 300) { // 5 minutes
        timerElement.classList.add('timer-critical');
    } else if (timeRemaining < 900) { // 15 minutes
        timerElement.classList.add('timer-warning');
    }
    
    // Update review modal time
    document.getElementById('reviewTime').textContent = timerDisplay;
    document.getElementById('submitTime').textContent = timerDisplay;
}

// Initialize question navigation
function initializeQuestionNavigation() {
    const navGrid = document.getElementById('questionNavGrid');
    navGrid.innerHTML = '';
    
    for (let i = 1; i <= examData.totalQuestions; i++) {
        const button = document.createElement('button');
        button.className = 'question-btn unattempted';
        button.textContent = i;
        button.setAttribute('data-question', i);
        
        button.addEventListener('click', () => {
            loadQuestion(i);
        });
        
        navGrid.appendChild(button);
    }
    
    updateQuestionNavigation();
}

// Update question navigation states
function updateQuestionNavigation() {
    const buttons = document.querySelectorAll('.question-btn');
    
    buttons.forEach(button => {
        const questionNum = parseInt(button.getAttribute('data-question'));
        const question = examData.questions[questionNum - 1];
        
        button.className = 'question-btn';
        
        if (questionNum === currentQuestion) {
            button.classList.add('current');
        } else if (question.answered) {
            button.classList.add('answered');
        } else if (question.flagged) {
            button.classList.add('flagged');
        } else {
            button.classList.add('unattempted');
        }
    });
}

// Load a specific question
function loadQuestion(questionNum) {
    if (questionNum < 1 || questionNum > examData.totalQuestions) return;
    
    currentQuestion = questionNum;
    const question = examData.questions[questionNum - 1];
    
    // Update question header
    document.getElementById('currentQuestionNumber').textContent = `Question ${questionNum}`;
    document.getElementById('questionPoints').textContent = `(${question.points} point${question.points !== 1 ? 's' : ''})`;
    document.getElementById('navInfo').textContent = `Question ${questionNum} of ${examData.totalQuestions}`;
    
    // Update flag button
    const flagBtn = document.getElementById('flagQuestionBtn');
    if (question.flagged) {
        flagBtn.classList.add('active');
        flagBtn.innerHTML = '<i class="fas fa-flag"></i><span>Remove Flag</span>';
    } else {
        flagBtn.classList.remove('active');
        flagBtn.innerHTML = '<i class="far fa-flag"></i><span>Flag for Review</span>';
    }
    
    // Update navigation buttons
    document.getElementById('prevQuestionBtn').disabled = questionNum === 1;
    document.getElementById('nextQuestionBtn').disabled = questionNum === examData.totalQuestions;
    
    // Load question content based on type
    loadQuestionContent(question);
    
    // Update question navigation
    updateQuestionNavigation();
}

// Load question content based on type
function loadQuestionContent(question) {
    const questionText = document.getElementById('questionText');
    const answerOptions = document.getElementById('answerOptions');
    const essayAnswer = document.getElementById('essayAnswer');
    const mathAnswer = document.getElementById('mathAnswer');
    
    // Reset all answer areas
    answerOptions.style.display = 'none';
    essayAnswer.style.display = 'none';
    mathAnswer.style.display = 'none';
    
    // Set question text
    questionText.textContent = question.text;
    
    // Load appropriate answer interface based on question type
    switch(question.type) {
        case 'multiple_choice':
            loadMultipleChoiceQuestion(question);
            break;
        case 'essay':
            loadEssayQuestion(question);
            break;
        case 'math':
            loadMathQuestion(question);
            break;
    }
}

// Load multiple choice question
function loadMultipleChoiceQuestion(question) {
    const answerOptions = document.getElementById('answerOptions');
    answerOptions.style.display = 'block';
    answerOptions.innerHTML = '';
    
    question.options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        if (userAnswers[currentQuestion] === option.id) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `
            <div class="option-marker">${option.id}</div>
            <div class="option-text">${option.text}</div>
        `;
        
        optionElement.addEventListener('click', () => {
            selectAnswer(option.id);
        });
        
        answerOptions.appendChild(optionElement);
    });
}

// Load essay question
function loadEssayQuestion(question) {
    const essayAnswer = document.getElementById('essayAnswer');
    essayAnswer.style.display = 'block';
    
    const essayText = document.getElementById('essayText');
    essayText.value = userAnswers[currentQuestion] || '';
    
    // Update word count
    updateWordCount();
    
    // Add event listeners
    essayText.addEventListener('input', () => {
        userAnswers[currentQuestion] = essayText.value;
        updateQuestionState();
        updateWordCount();
    });
}

// Load math question
function loadMathQuestion(question) {
    const mathAnswer = document.getElementById('mathAnswer');
    mathAnswer.style.display = 'block';
    
    const mathExpression = document.getElementById('mathExpression');
    mathExpression.value = userAnswers[currentQuestion] || '';
    
    // Update preview
    updateMathPreview();
    
    // Add event listeners
    mathExpression.addEventListener('input', () => {
        userAnswers[currentQuestion] = mathExpression.value;
        updateQuestionState();
        updateMathPreview();
    });
}

// Update word count for essay questions
function updateWordCount() {
    const essayText = document.getElementById('essayText');
    const wordCount = document.getElementById('wordCount');
    const text = essayText.value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    wordCount.textContent = words;
}

// Update math preview
function updateMathPreview() {
    const mathExpression = document.getElementById('mathExpression');
    const mathPreview = document.getElementById('mathPreview');
    const expression = mathExpression.value.trim();
    
    if (expression === '') {
        mathPreview.textContent = 'Your expression will appear here';
    } else {
        // In a real app, you would use a math rendering library like MathJax
        mathPreview.textContent = `$${expression}$`;
    }
}

// Select an answer for multiple choice
function selectAnswer(answerId) {
    userAnswers[currentQuestion] = answerId;
    
    // Update UI
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    updateQuestionState();
}

// Update question state (answered/flagged)
function updateQuestionState() {
    const question = examData.questions[currentQuestion - 1];
    question.answered = userAnswers[currentQuestion] !== undefined && userAnswers[currentQuestion] !== '';
    
    updateProgressCounts();
    updateQuestionNavigation();
}

// Update progress counts
function updateProgressCounts() {
    const answered = Object.keys(userAnswers).filter(key => userAnswers[key] !== undefined && userAnswers[key] !== '').length;
    const flagged = flaggedQuestions.size;
    const remaining = examData.totalQuestions - answered;
    
    document.getElementById('answeredCount').textContent = answered;
    document.getElementById('flaggedCount').textContent = flagged;
    document.getElementById('remainingCount').textContent = remaining;
    
    // Update review modal
    document.getElementById('reviewTotal').textContent = examData.totalQuestions;
    document.getElementById('reviewAnswered').textContent = answered;
    document.getElementById('reviewFlagged').textContent = flagged;
    
    // Update submit modal
    document.getElementById('submitAnswered').textContent = answered;
    document.getElementById('submitFlagged').textContent = flagged;
    
    // Update exit modal
    const progressPercent = Math.round((answered / examData.totalQuestions) * 100);
    document.getElementById('exitProgress').textContent = `${progressPercent}%`;
    
    const timeUsed = totalTime - timeRemaining;
    const hours = Math.floor(timeUsed / 3600);
    const minutes = Math.floor((timeUsed % 3600) / 60);
    const seconds = timeUsed % 60;
    document.getElementById('exitTimeUsed').textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('prevQuestionBtn').addEventListener('click', () => {
        loadQuestion(currentQuestion - 1);
    });
    
    document.getElementById('nextQuestionBtn').addEventListener('click', () => {
        loadQuestion(currentQuestion + 1);
    });
    
    // Flag question
    document.getElementById('flagQuestionBtn').addEventListener('click', toggleFlagQuestion);
    
    // Review button
    document.getElementById('reviewBtn').addEventListener('click', showReviewModal);
    
    // Submit button
    document.getElementById('submitExamBtn').addEventListener('click', showSubmitModal);
    
    // Exit button
    document.getElementById('exitExamBtn').addEventListener('click', showExitModal);
    
    // Modal events
    setupModalEvents();
}

// Toggle flag for current question
function toggleFlagQuestion() {
    const question = examData.questions[currentQuestion - 1];
    
    if (flaggedQuestions.has(currentQuestion)) {
        flaggedQuestions.delete(currentQuestion);
        question.flagged = false;
    } else {
        flaggedQuestions.add(currentQuestion);
        question.flagged = true;
    }
    
    updateProgressCounts();
    updateQuestionNavigation();
    loadQuestion(currentQuestion); // Reload to update flag button
}

// Show review modal
function showReviewModal() {
    const modal = document.getElementById('reviewModal');
    const reviewGrid = document.getElementById('reviewGrid');
    
    // Populate review grid
    reviewGrid.innerHTML = '';
    
    for (let i = 1; i <= examData.totalQuestions; i++) {
        const question = examData.questions[i - 1];
        const reviewItem = document.createElement('div');
        
        let itemClass = 'review-item';
        if (i === currentQuestion) {
            itemClass += ' current';
        } else if (question.answered) {
            itemClass += ' answered';
        } else if (question.flagged) {
            itemClass += ' flagged';
        } else {
            itemClass += ' unattempted';
        }
        
        reviewItem.className = itemClass;
        reviewItem.textContent = i;
        reviewItem.setAttribute('data-question', i);
        
        reviewItem.addEventListener('click', () => {
            loadQuestion(i);
            closeModal('reviewModal');
        });
        
        reviewGrid.appendChild(reviewItem);
    }
    
    showModal('reviewModal');
}

// Show submit modal
function showSubmitModal() {
    showModal('submitModal');
}

// Show exit modal
function showExitModal() {
    showModal('exitModal');
}

// Setup modal events
function setupModalEvents() {
    // Review modal
    document.getElementById('reviewModalClose').addEventListener('click', () => closeModal('reviewModal'));
    document.getElementById('closeReviewBtn').addEventListener('click', () => closeModal('reviewModal'));
    document.getElementById('continueExamBtn').addEventListener('click', () => closeModal('reviewModal'));
    
    // Submit modal
    document.getElementById('submitModalClose').addEventListener('click', () => closeModal('submitModal'));
    document.getElementById('cancelSubmitBtn').addEventListener('click', () => closeModal('submitModal'));
    document.getElementById('confirmSubmitBtn').addEventListener('click', submitExam);
    
    // Exit modal
    document.getElementById('exitModalClose').addEventListener('click', () => closeModal('exitModal'));
    document.getElementById('cancelExitBtn').addEventListener('click', () => closeModal('exitModal'));
    document.getElementById('confirmExitBtn').addEventListener('click', exitExam);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    
    setTimeout(() => {
        modal.querySelector('.modal').style.transform = 'scale(1)';
        modal.querySelector('.modal').style.opacity = '1';
    }, 100);
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal');
    
    modalContent.style.transform = 'scale(0.9)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Save progress
function saveProgress() {
    const progress = {
        answers: userAnswers,
        flagged: Array.from(flaggedQuestions),
        currentQuestion: currentQuestion,
        startTime: Date.now() - (totalTime - timeRemaining) * 1000
    };
    
    localStorage.setItem(`exam_progress_${examData.id}`, JSON.stringify(progress));
}

// Submit exam
function submitExam() {
    // Show loading state
    const submitBtn = document.getElementById('confirmSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    // Save final progress
    saveProgress();
    
    // Simulate API call
    setTimeout(() => {
        // Clear progress
        localStorage.removeItem(`exam_progress_${examData.id}`);
        
        // Stop timer
        clearInterval(examTimer);
        
        // Show success message
        alert('Exam submitted successfully! Redirecting to results...');
        
        window.location.href = `result.html?exam=${examData.id}`;
        
        console.log('Exam submitted successfully');
    }, 2000);
}

// Exit exam
function exitExam() {
    // Save progress
    saveProgress();
    
    // Stop timer
    clearInterval(examTimer);
    
    // Show confirmation
    alert('Exam progress saved. You can resume later.');
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Auto-submit when time runs out
function autoSubmitExam() {
    const submitBtn = document.getElementById('confirmSubmitBtn');
    submitBtn.click();
}

// Handle beforeunload event to warn about leaving
window.addEventListener('beforeunload', (e) => {
    if (timeRemaining > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - potentially switching tabs
        // In a real exam system, you might want to track this as suspicious activity
        console.warn('Exam page is not visible - this may be recorded');
    }
});