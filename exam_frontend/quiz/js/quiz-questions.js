// Practice quiz data
const practiceQuestions = [
    {
        id: 1,
        question: "What is the value of π (pi) approximately equal to?",
        options: [
            "3.14",
            "2.71",
            "1.41",
            "1.61"
        ],
        correctAnswer: 0,
        hint: "π is the ratio of a circle's circumference to its diameter.",
        explanation: "π (pi) is approximately 3.14159, but it's commonly rounded to 3.14 for calculations."
    },
    {
        id: 2,
        question: "Which of the following is a prime number?",
        options: [
            "15",
            "21",
            "29",
            "39"
        ],
        correctAnswer: 2,
        hint: "A prime number is only divisible by 1 and itself.",
        explanation: "29 is a prime number because it has no divisors other than 1 and 29."
    },
    {
        id: 3,
        question: "What is the chemical symbol for gold?",
        options: [
            "Go",
            "Gd",
            "Au",
            "Ag"
        ],
        correctAnswer: 2,
        hint: "This element's symbol comes from its Latin name 'aurum'.",
        explanation: "The chemical symbol for gold is Au, derived from its Latin name 'aurum'."
    },
    {
        id: 4,
        question: "Which planet is known as the Red Planet?",
        options: [
            "Venus",
            "Mars",
            "Jupiter",
            "Saturn"
        ],
        correctAnswer: 1,
        hint: "This planet's red color comes from iron oxide on its surface.",
        explanation: "Mars is called the Red Planet due to iron oxide (rust) on its surface."
    },
    {
        id: 5,
        question: "What is the capital of France?",
        options: [
            "London",
            "Berlin",
            "Paris",
            "Madrid"
        ],
        correctAnswer: 2,
        hint: "This city is famous for the Eiffel Tower.",
        explanation: "Paris is the capital and most populous city of France."
    }
];

// DOM Elements
const questionNavGrid = document.getElementById('questionNavGrid');
const answeredCount = document.getElementById('answeredCount');
const flaggedCount = document.getElementById('flaggedCount');
const reviewedCount = document.getElementById('reviewedCount');
const remainingCount = document.getElementById('remainingCount');
const currentQuestionNumber = document.getElementById('currentQuestionNumber');
const questionText = document.getElementById('questionText');
const answerOptions = document.getElementById('answerOptions');
const feedbackSection = document.getElementById('feedbackSection');
const feedbackContent = document.getElementById('feedbackContent');
const explanationSection = document.getElementById('explanationSection');
const flagQuestionBtn = document.getElementById('flagQuestionBtn');
const hintBtn = document.getElementById('hintBtn');
const prevQuestionBtn = document.getElementById('prevQuestionBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const navInfo = document.getElementById('navInfo');
const checkAnswerBtn = document.getElementById('checkAnswerBtn');
const finishPracticeBtn = document.getElementById('finishPracticeBtn');
const reviewBtn = document.getElementById('reviewBtn');
const exitPracticeBtn = document.getElementById('exitPracticeBtn');
const timerDisplay = document.getElementById('timerDisplay');

// Modal elements
const hintModal = document.getElementById('hintModal');
const hintText = document.getElementById('hintText');
const resultsModal = document.getElementById('resultsModal');
const exitModal = document.getElementById('exitModal');

// Practice state
let currentQuestionIndex = 0;
let userAnswers = Array(practiceQuestions.length).fill(null);
let flaggedQuestions = Array(practiceQuestions.length).fill(false);
let reviewedQuestions = Array(practiceQuestions.length).fill(false);
let startTime = new Date();
let timerInterval;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializePractice();
    startTimer();
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Setup event listeners
function setupEventListeners() {
    flagQuestionBtn.addEventListener('click', toggleFlagQuestion);
    hintBtn.addEventListener('click', showHint);
    prevQuestionBtn.addEventListener('click', goToPreviousQuestion);
    nextQuestionBtn.addEventListener('click', goToNextQuestion);
    checkAnswerBtn.addEventListener('click', checkAnswer);
    finishPracticeBtn.addEventListener('click', finishPractice);
    reviewBtn.addEventListener('click', showReview);
    exitPracticeBtn.addEventListener('click', showExitModal);

    // Modal events
    document.getElementById('hintModalClose').addEventListener('click', () => hintModal.classList.remove('active'));
    document.getElementById('closeHintBtn').addEventListener('click', () => hintModal.classList.remove('active'));
    document.getElementById('resultsModalClose').addEventListener('click', () => resultsModal.classList.remove('active'));
    document.getElementById('exitModalClose').addEventListener('click', () => exitModal.classList.remove('active'));
    document.getElementById('cancelExitBtn').addEventListener('click', () => exitModal.classList.remove('active'));
    document.getElementById('confirmExitBtn').addEventListener('click', confirmExit);
    document.getElementById('reviewAnswersBtn').addEventListener('click', reviewAnswers);
    document.getElementById('newPracticeBtn').addEventListener('click', startNewPractice);
}

// Initialize practice session
function initializePractice() {
    loadQuestionNavigation();
    loadQuestion(currentQuestionIndex);
    updateProgressStats();
}

// Load question navigation grid
function loadQuestionNavigation() {
    questionNavGrid.innerHTML = '';
    practiceQuestions.forEach((question, index) => {
        const button = document.createElement('button');
        button.className = 'question-btn';
        button.textContent = index + 1;
        button.addEventListener('click', () => goToQuestion(index));
        questionNavGrid.appendChild(button);
    });
    updateQuestionNavigation();
}

// Load a specific question
function loadQuestion(index) {
    const question = practiceQuestions[index];
    
    // Update question number and navigation
    currentQuestionNumber.textContent = `Question ${index + 1}`;
    navInfo.textContent = `Question ${index + 1} of ${practiceQuestions.length}`;
    
    // Update question text
    questionText.textContent = question.question;
    
    // Load answer options
    loadAnswerOptions(question, index);
    
    // Update navigation buttons
    prevQuestionBtn.disabled = index === 0;
    nextQuestionBtn.disabled = index === practiceQuestions.length - 1;
    
    // Update flagged button
    updateFlagButton();
    
    // Hide feedback initially
    feedbackSection.classList.remove('show');
    
    // Update question navigation
    updateQuestionNavigation();
}

// Load answer options
function loadAnswerOptions(question, questionIndex) {
    answerOptions.innerHTML = '';
    
    question.options.forEach((option, optionIndex) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        if (userAnswers[questionIndex] === optionIndex) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `
            <div class="option-marker">${String.fromCharCode(65 + optionIndex)}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionElement.addEventListener('click', () => selectAnswer(optionIndex));
        answerOptions.appendChild(optionElement);
    });
}

// Select an answer
function selectAnswer(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    loadAnswerOptions(practiceQuestions[currentQuestionIndex], currentQuestionIndex);
    updateProgressStats();
}

// Check current answer
function checkAnswer() {
    const question = practiceQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    
    if (userAnswer === null) {
        showFeedback('Please select an answer before checking.', false);
        return;
    }
    
    const isCorrect = userAnswer === question.correctAnswer;
    const correctOption = document.querySelectorAll('.answer-option')[question.correctAnswer];
    const userOption = document.querySelectorAll('.answer-option')[userAnswer];
    
    // Show correct answer
    correctOption.classList.add('correct');
    
    // Show user's answer
    if (!isCorrect) {
        userOption.classList.add('incorrect');
    }
    
    // Show feedback
    showFeedback(
        isCorrect ? 'Correct! Well done.' : 'Not quite right. The correct answer is highlighted.',
        isCorrect,
        question.explanation
    );
    
    // Mark as reviewed
    reviewedQuestions[currentQuestionIndex] = true;
    updateProgressStats();
}

// Show feedback
function showFeedback(message, isCorrect, explanation = '') {
    feedbackContent.innerHTML = `
        <p style="color: ${isCorrect ? '#28a745' : '#dc3545'}; font-weight: 600;">
            <i class="fas fa-${isCorrect ? 'check' : 'times'}"></i>
            ${message}
        </p>
    `;
    
    if (explanation) {
        explanationSection.innerHTML = `
            <h4>Explanation:</h4>
            <p>${explanation}</p>
        `;
    } else {
        explanationSection.innerHTML = '';
    }
    
    feedbackSection.classList.add('show');
}

// Toggle flag for current question
function toggleFlagQuestion() {
    flaggedQuestions[currentQuestionIndex] = !flaggedQuestions[currentQuestionIndex];
    updateFlagButton();
    updateProgressStats();
}

// Update flag button state
function updateFlagButton() {
    const isFlagged = flaggedQuestions[currentQuestionIndex];
    flagQuestionBtn.classList.toggle('flagged', isFlagged);
    flagQuestionBtn.innerHTML = `
        <i class="fas fa-flag"></i>
        <span>${isFlagged ? 'Remove Flag' : 'Flag for Review'}</span>
    `;
}

// Show hint for current question
function showHint() {
    const question = practiceQuestions[currentQuestionIndex];
    hintText.textContent = question.hint;
    hintModal.classList.add('active');
}

// Navigation functions
function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

function goToNextQuestion() {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    loadQuestion(currentQuestionIndex);
}

// Update question navigation highlights
function updateQuestionNavigation() {
    const buttons = document.querySelectorAll('.question-btn');
    buttons.forEach((button, index) => {
        button.classList.remove('current', 'answered', 'flagged', 'reviewed');
        
        if (index === currentQuestionIndex) {
            button.classList.add('current');
        }
        if (userAnswers[index] !== null) {
            button.classList.add('answered');
        }
        if (flaggedQuestions[index]) {
            button.classList.add('flagged');
        }
        if (reviewedQuestions[index]) {
            button.classList.add('reviewed');
        }
    });
}

// Update progress statistics
function updateProgressStats() {
    const answered = userAnswers.filter(answer => answer !== null).length;
    const flagged = flaggedQuestions.filter(flag => flag).length;
    const reviewed = reviewedQuestions.filter(review => review).length;
    const remaining = practiceQuestions.length - answered;
    
    answeredCount.textContent = answered;
    flaggedCount.textContent = flagged;
    reviewedCount.textContent = reviewed;
    remainingCount.textContent = remaining;
}

// Start timer
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

// Update timer display
function updateTimer() {
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    timerDisplay.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Show review
function showReview() {
    // In a real implementation, this would show a detailed review
    alert('Review feature would show detailed progress and analytics.');
}

// Finish practice session
function finishPractice() {
    showResults();
}

// Show results modal
function showResults() {
    const answered = userAnswers.filter(answer => answer !== null).length;
    const correct = userAnswers.filter((answer, index) => 
        answer === practiceQuestions[index].correctAnswer
    ).length;
    const score = Math.round((correct / practiceQuestions.length) * 100);
    const timeSpent = timerDisplay.textContent;
    
    document.getElementById('finalScore').textContent = `${score}%`;
    document.getElementById('correctAnswers').textContent = correct;
    document.getElementById('totalQuestions').textContent = practiceQuestions.length;
    document.getElementById('timeSpent').textContent = timeSpent;
    document.getElementById('completionRate').textContent = `${Math.round((answered / practiceQuestions.length) * 100)}%`;
    
    resultsModal.classList.add('active');
    clearInterval(timerInterval);
}

// Show exit confirmation modal
function showExitModal() {
    const answered = userAnswers.filter(answer => answer !== null).length;
    document.getElementById('exitAnswered').textContent = answered;
    document.getElementById('exitTime').textContent = timerDisplay.textContent;
    exitModal.classList.add('active');
}

// Confirm exit
function confirmExit() {
    showResults();
    exitModal.classList.remove('active');
}

// Review answers
function reviewAnswers() {
    // Go to first question and allow review
    currentQuestionIndex = 0;
    loadQuestion(currentQuestionIndex);
    resultsModal.classList.remove('active');
}

// Start new practice session
function startNewPractice() {
    // Reset all state
    currentQuestionIndex = 0;
    userAnswers = Array(practiceQuestions.length).fill(null);
    flaggedQuestions = Array(practiceQuestions.length).fill(false);
    reviewedQuestions = Array(practiceQuestions.length).fill(false);
    
    // Reinitialize
    initializePractice();
    startTime = new Date();
    startTimer();
    
    resultsModal.classList.remove('active');
}