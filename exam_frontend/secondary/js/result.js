// Results Page JavaScript

let resultData = {};
let currentReviewQuestion = 0;
let reviewQuestions = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the results page
    initializeResults();
    
    // Setup event listeners
    setupEventListeners();
    
    // Create particles
    if (typeof createParticles === 'function') {
        createParticles();
    }

    hidePreloader();
});

// Initialize results
function initializeResults() {
    // Get result data from URL parameters or generate sample data
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('exam') || '1';
    
    // Load result data
    loadResultData(examId);
    
    // Initialize chart
    initializeChart();
    
    // Update UI with result data
    updateResultUI();
}

// Load result data
function loadResultData(examId) {
    // In a real app, this would come from an API
    resultData = {
        exam: {
            id: examId,
            name: 'Mathematics Final Examination',
            date: '2024-01-15 14:30',
            duration: '2 Hours',
            totalQuestions: 50
        },
        performance: {
            score: 85,
            correctAnswers: 42,
            incorrectAnswers: 8,
            skippedAnswers: 0,
            timeTaken: '01:45:23',
            accuracy: 84,
            speed: '2.1 min/q',
            completion: 100,
            percentile: 92
        },
        topics: [
            { name: 'Algebra', score: 90, correct: 9, total: 10 },
            { name: 'Geometry', score: 85, correct: 17, total: 20 },
            { name: 'Calculus', score: 75, correct: 6, total: 8 },
            { name: 'Statistics', score: 80, correct: 8, total: 10 },
            { name: 'Trigonometry', score: 70, correct: 7, total: 10 }
        ],
        questions: generateSampleQuestions(50),
        student: {
            name: 'John Doe',
            id: 'S12345'
        }
    };
    
    // Prepare review questions
    reviewQuestions = resultData.questions;
}

// Generate sample questions for review
function generateSampleQuestions(count) {
    const questions = [];
    
    for (let i = 1; i <= count; i++) {
        const isCorrect = i <= 42; // First 42 are correct
        const isFlagged = i % 7 === 0; // Every 7th question was flagged
        
        questions.push({
            id: i,
            text: `This is question ${i} of the examination. What is the correct answer?`,
            type: 'multiple_choice',
            options: [
                { id: 'A', text: 'Option A' },
                { id: 'B', text: 'Option B' },
                { id: 'C', text: 'Option C' },
                { id: 'D', text: 'Option D' }
            ],
            correctAnswer: 'C',
            userAnswer: isCorrect ? 'C' : 'A',
            isCorrect: isCorrect,
            isFlagged: isFlagged,
            explanation: `This is the explanation for question ${i}. The correct answer is C because...`,
            topic: getTopicForQuestion(i)
        });
    }
    
    return questions;
}

function getTopicForQuestion(questionId) {
    const topics = ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'];
    return topics[questionId % topics.length];
}

// Initialize performance chart
function initializeChart() {
    const ctx = document.getElementById('topicChart').getContext('2d');
    
    const topicNames = resultData.topics.map(topic => topic.name);
    const topicScores = resultData.topics.map(topic => topic.score);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topicNames,
            datasets: [{
                label: 'Score (%)',
                data: topicScores,
                backgroundColor: [
                    'rgba(110, 68, 255, 0.8)',
                    'rgba(0, 201, 255, 0.8)',
                    'rgba(255, 46, 99, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)'
                ],
                borderColor: [
                    'rgba(110, 68, 255, 1)',
                    'rgba(0, 201, 255, 1)',
                    'rgba(255, 46, 99, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(110, 68, 255, 1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(110, 68, 255, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text-muted)',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(110, 68, 255, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text)',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Update UI with result data
function updateResultUI() {
    // Update basic info
    document.getElementById('examName').textContent = resultData.exam.name;
    document.getElementById('scorePercent').textContent = resultData.performance.score + '%';
    document.getElementById('correctAnswers').textContent = resultData.performance.correctAnswers;
    document.getElementById('totalQuestions').textContent = resultData.exam.totalQuestions;
    document.getElementById('timeTaken').textContent = resultData.performance.timeTaken;
    document.getElementById('submissionDate').textContent = resultData.exam.date;
    
    // Update metrics
    document.getElementById('accuracyMetric').textContent = resultData.performance.accuracy + '%';
    document.getElementById('speedMetric').textContent = resultData.performance.speed;
    document.getElementById('completionMetric').textContent = resultData.performance.completion + '%';
    document.getElementById('percentileMetric').textContent = resultData.performance.percentile + '%';
    
    // Update progress bars
    updateProgressBars();
    
    // Update topic breakdown
    updateTopicBreakdown();
    
    // Update question summary
    updateQuestionSummary();
    
    // Update score circle
    updateScoreCircle();
}

// Update progress bars
function updateProgressBars() {
    const accuracyFill = document.querySelector('.progress-fill.accuracy');
    const speedFill = document.querySelector('.progress-fill.speed');
    const completionFill = document.querySelector('.progress-fill.completion');
    const rankFill = document.querySelector('.progress-fill.rank');
    
    if (accuracyFill) accuracyFill.style.width = resultData.performance.accuracy + '%';
    if (speedFill) speedFill.style.width = '70%'; // Speed is relative
    if (completionFill) completionFill.style.width = resultData.performance.completion + '%';
    if (rankFill) rankFill.style.width = resultData.performance.percentile + '%';
}

// Update topic breakdown
function updateTopicBreakdown() {
    const topicList = document.getElementById('topicList');
    topicList.innerHTML = '';
    
    resultData.topics.forEach(topic => {
        const topicElement = document.createElement('div');
        topicElement.className = 'topic-stat';
        
        topicElement.innerHTML = `
            <div class="topic-info">
                <div class="topic-name">${topic.name}</div>
                <div class="topic-score">${topic.score}%</div>
            </div>
            <div class="topic-progress">
                <div class="topic-progress-fill" style="width: ${topic.score}%"></div>
            </div>
            <div class="topic-details">
                <small>${topic.correct}/${topic.total} correct</small>
            </div>
        `;
        
        topicList.appendChild(topicElement);
    });
}

// Update question summary
function updateQuestionSummary() {
    document.getElementById('correctCount').textContent = resultData.performance.correctAnswers;
    document.getElementById('incorrectCount').textContent = resultData.performance.incorrectAnswers;
    document.getElementById('skippedCount').textContent = resultData.performance.skippedAnswers;
}

// Update score circle
function updateScoreCircle() {
    const scoreProgress = document.getElementById('scoreProgress');
    const score = resultData.performance.score;
    
    scoreProgress.style.background = `conic-gradient(var(--primary) 0% ${score}%, rgba(110, 68, 255, 0.1) ${score}% 100%)`;
}

// Setup event listeners
function setupEventListeners() {
    // Review buttons
    document.getElementById('viewAllQuestions').addEventListener('click', () => {
        showQuestionReview('all');
    });
    
    document.getElementById('viewIncorrect').addEventListener('click', () => {
        showQuestionReview('incorrect');
    });
    
    document.getElementById('viewFlagged').addEventListener('click', () => {
        showQuestionReview('flagged');
    });
    
    // Action buttons
    document.getElementById('retakeExam').addEventListener('click', retakeExam);
    document.getElementById('downloadResults').addEventListener('click', downloadResults);
    document.getElementById('backToDashboard').addEventListener('click', backToDashboard);
    
    // Modal events
    setupModalEvents();
}

// Show question review
function showQuestionReview(filter) {
    let questionsToShow = [];
    
    switch(filter) {
        case 'all':
            questionsToShow = reviewQuestions;
            break;
        case 'incorrect':
            questionsToShow = reviewQuestions.filter(q => !q.isCorrect);
            break;
        case 'flagged':
            questionsToShow = reviewQuestions.filter(q => q.isFlagged);
            break;
        default:
            questionsToShow = reviewQuestions;
    }
    
    if (questionsToShow.length === 0) {
        alert('No questions match the selected filter.');
        return;
    }
    
    reviewQuestions = questionsToShow;
    currentReviewQuestion = 0;
    
    loadReviewQuestion();
    showModal('questionModal');
}

// Load review question
function loadReviewQuestion() {
    const question = reviewQuestions[currentReviewQuestion];
    const reviewContent = document.getElementById('questionReviewContent');
    
    reviewContent.innerHTML = `
        <div class="review-question">
            <div class="question-status ${question.isCorrect ? 'status-correct' : 'status-incorrect'}">
                ${question.isCorrect ? '✓ Correct' : '✗ Incorrect'} • Question ${currentReviewQuestion + 1} of ${reviewQuestions.length}
            </div>
            
            <div class="question-text">
                ${question.text}
            </div>
            
            <div class="answer-comparison">
                <div class="answer-box your-answer">
                    <div class="answer-label">Your Answer</div>
                    <div class="answer-content">${getOptionText(question, question.userAnswer)}</div>
                </div>
                
                <div class="answer-box correct-answer">
                    <div class="answer-label">Correct Answer</div>
                    <div class="answer-content">${getOptionText(question, question.correctAnswer)}</div>
                </div>
            </div>
            
            <div class="explanation">
                <h4>Explanation:</h4>
                <p>${question.explanation}</p>
            </div>
            
            <div class="question-meta">
                <small><strong>Topic:</strong> ${question.topic}</small>
                ${question.isFlagged ? '<small style="color: var(--accent); margin-left: 1rem;"><strong>Flagged for Review</strong></small>' : ''}
            </div>
        </div>
    `;
    
    // Update navigation buttons
    document.getElementById('nextQuestion').style.display = 
        currentReviewQuestion < reviewQuestions.length - 1 ? 'flex' : 'none';
}

// Get option text
function getOptionText(question, optionId) {
    const option = question.options.find(opt => opt.id === optionId);
    return option ? `${option.id}. ${option.text}` : 'No answer provided';
}

// Setup modal events
function setupModalEvents() {
    // Question modal
    document.getElementById('questionModalClose').addEventListener('click', () => closeModal('questionModal'));
    document.getElementById('closeQuestionModal').addEventListener('click', () => closeModal('questionModal'));
    document.getElementById('nextQuestion').addEventListener('click', nextReviewQuestion);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Next review question
function nextReviewQuestion() {
    if (currentReviewQuestion < reviewQuestions.length - 1) {
        currentReviewQuestion++;
        loadReviewQuestion();
    } else {
        closeModal('questionModal');
    }
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

// Retake exam
function retakeExam() {
    if (confirm('Are you sure you want to retake this exam? Your previous results will be archived.')) {
        // Show loading state
        const button = document.getElementById('retakeExam');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing Exam...';
        button.disabled = true;
        
        setTimeout(() => {
            // Redirect to exam instruction page
            window.location.href = `exam-instruction.html?exam=${resultData.exam.id}`;
        }, 1500);
    }
}

// Download results
function downloadResults() {
    // Show loading state
    const button = document.getElementById('downloadResults');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    button.disabled = true;
    
    setTimeout(() => {
        // In a real app, this would generate and download a PDF
        alert('Results PDF generated successfully! Starting download...');
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        console.log('Downloading results PDF...');
    }, 2000);
}

// Back to dashboard
function backToDashboard() {
    window.location.href = 'dashboard.html';
}