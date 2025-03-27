document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');
    const scoreElement = document.getElementById('score');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const timeElement = document.getElementById('time');
    
    const finalScoreElement = document.getElementById('final-score');
    const maxScoreElement = document.getElementById('max-score');
    const resultMessageElement = document.getElementById('result-message');
    const progressBar = document.getElementById('progress-bar');
    
    // Quiz variables
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 30;
    
    // API URL
    const API_URL = 'https://opentdb.com/api.php?amount=10&category=17&difficulty=easy';
    
    // Event Listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
    
    // Functions
    async function startQuiz() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            if (data.response_code === 0) {
                questions = data.results.map(question => {
                    // Decode HTML entities in question and answers
                    const decodedQuestion = decodeHTML(question.question);
                    const decodedCorrectAnswer = decodeHTML(question.correct_answer);
                    const decodedIncorrectAnswers = question.incorrect_answers.map(answer => decodeHTML(answer));
                    
                    return {
                        ...question,
                        question: decodedQuestion,
                        correct_answer: decodedCorrectAnswer,
                        incorrect_answers: decodedIncorrectAnswers,
                        shuffledAnswers: shuffleArray([decodedCorrectAnswer, ...decodedIncorrectAnswers])
                    };
                });
                
                startScreen.classList.add('hidden');
                quizScreen.classList.remove('hidden');
                
                totalQuestionsElement.textContent = questions.length;
                showQuestion();
            } else {
                alert('Could not load questions. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            alert('An error occurred while fetching questions. Please check your connection and try again.');
        }
    }
    
    function showQuestion() {
        resetState();
        const currentQuestion = questions[currentQuestionIndex];
        
        questionElement.textContent = currentQuestion.question;
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        
        currentQuestion.shuffledAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('answer-btn');
            button.addEventListener('click', selectAnswer);
            answersElement.appendChild(button);
        });
        
        startTimer();
    }
    
    function startTimer() {
        timeLeft = 30;
        timeElement.textContent = timeLeft;
        
        timer = setInterval(() => {
            timeLeft--;
            timeElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                handleTimeOut();
            }
        }, 1000);
    }
    
    function handleTimeOut() {
        const currentQuestion = questions[currentQuestionIndex];
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach(button => {
            button.classList.add('disabled');
            if (button.textContent === currentQuestion.correct_answer) {
                button.classList.add('correct');
            }
        });
        
        nextBtn.classList.remove('hidden');
    }
    
    function resetState() {
        clearInterval(timer);
        nextBtn.classList.add('hidden');
        
        while (answersElement.firstChild) {
            answersElement.removeChild(answersElement.firstChild);
        }
    }
    
    function selectAnswer(e) {
        const selectedButton = e.target;
        const correctAnswer = questions[currentQuestionIndex].correct_answer;
        const isCorrect = selectedButton.textContent === correctAnswer;
        
        clearInterval(timer);
        
        if (isCorrect) {
            selectedButton.classList.add('correct');
            score++;
            scoreElement.textContent = score;
        } else {
            selectedButton.classList.add('incorrect');
            // Highlight the correct answer
            document.querySelectorAll('.answer-btn').forEach(button => {
                if (button.textContent === correctAnswer) {
                    button.classList.add('correct');
                }
            });
        }
        
        // Disable all buttons
        document.querySelectorAll('.answer-btn').forEach(button => {
            button.classList.add('disabled');
        });
        
        nextBtn.classList.remove('hidden');
    }
    
    function nextQuestion() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }
    
    function showResults() {
        quizScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
        
        const percentage = (score / questions.length) * 100;
        
        finalScoreElement.textContent = score;
        maxScoreElement.textContent = questions.length;
        
        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = `${percentage}%`;
        }, 100);
        
        // Set result message based on score
        if (percentage >= 80) {
            resultMessageElement.textContent = 'Excellent! You really know your science!';
            resultMessageElement.style.color = '#2ecc71';
        } else if (percentage >= 50) {
            resultMessageElement.textContent = 'Good job! You did well!';
            resultMessageElement.style.color = '#3498db';
        } else {
            resultMessageElement.textContent = 'Keep learning! Science is fun!';
            resultMessageElement.style.color = '#e74c3c';
        }
    }
    
    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        questions = [];
        
        scoreElement.textContent = '0';
        
        resultsScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }
    
    // Helper functions
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }
});

// 



let questions = [];
let currentQuestionId = null;

// DOM elements
const fetchBtn = document.getElementById('fetchBtn');
const addBtn = document.getElementById('addBtn');
const questionForm = document.getElementById('questionForm');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const questionsContainer = document.getElementById('questionsContainer');

// Form fields
const questionField = document.getElementById('question');
const correctAnswerField = document.getElementById('correctAnswer');
const incorrectAnswersField = document.getElementById('incorrectAnswers');
const difficultyField = document.getElementById('difficulty');

// Initialize the app
function init() {
    // Load any saved questions from localStorage
    const savedQuestions = localStorage.getItem('triviaQuestions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        renderQuestions();
    }

    // Add event listeners
    fetchBtn.addEventListener('click', fetchQuestions);
    addBtn.addEventListener('click', showAddForm);
    saveBtn.addEventListener('click', saveQuestion);
    cancelBtn.addEventListener('click', hideForm);
}

// Fetch questions from API
async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=17&difficulty=easy');
        const data = await response.json();
        
        // Transform API data to our format
        const newQuestions = data.results.map((q, index) => ({
            id: Date.now() + index, // Simple unique ID
            question: decodeHtmlEntities(q.question),
            correctAnswer: decodeHtmlEntities(q.correct_answer),
            incorrectAnswers: q.incorrect_answers.map(a => decodeHtmlEntities(a)),
            difficulty: q.difficulty,
            category: q.category
        }));
        
        questions = [...questions, ...newQuestions];
        saveToLocalStorage();
        renderQuestions();
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to fetch questions. Please try again.');
    }
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Render all questions
function renderQuestions() {
    questionsContainer.innerHTML = '';
    
    if (questions.length === 0) {
        questionsContainer.innerHTML = '<p>No questions available. Fetch or add some!</p>';
        return;
    }
    
    questions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <h3>${q.question}</h3>
            <p><strong>Category:</strong> ${q.category || 'Science & Nature'}</p>
            <p><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
            <p><strong>Incorrect Answers:</strong> ${q.incorrectAnswers.join(', ')}</p>
            <p><strong>Difficulty:</strong> ${q.difficulty}</p>
            <button data-id="${q.id}" class="edit-btn">Edit</button>
            <button data-id="${q.id}" class="delete-btn">Delete</button>
        `;
        questionsContainer.appendChild(card);
    });

    // Add event listeners to dynamically created buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editQuestion(parseInt(e.target.dataset.id)));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteQuestion(parseInt(e.target.dataset.id)));
    });
}

// Show form for adding a new question
function showAddForm() {
    currentQuestionId = null;
    resetForm();
    questionForm.style.display = 'block';
}

// Show form for editing an existing question
function editQuestion(id) {
    const question = questions.find(q => q.id === id);
    if (!question) return;
    
    currentQuestionId = id;
    questionField.value = question.question;
    correctAnswerField.value = question.correctAnswer;
    incorrectAnswersField.value = question.incorrectAnswers.join(', ');
    difficultyField.value = question.difficulty;
    
    questionForm.style.display = 'block';
}

// Save question (create or update)
function saveQuestion() {
    const questionText = questionField.value.trim();
    const correctAnswer = correctAnswerField.value.trim();
    const incorrectAnswers = incorrectAnswersField.value.split(',').map(a => a.trim()).filter(a => a);
    const difficulty = difficultyField.value;
    
    if (!questionText || !correctAnswer || incorrectAnswers.length === 0 || !difficulty) {
        alert('Please fill in all fields');
        return;
    }
    
    const questionData = {
        id: currentQuestionId || Date.now(),
        question: questionText,
        correctAnswer,
        incorrectAnswers,
        difficulty,
        category: "Science & Nature"
    };
    
    if (currentQuestionId) {
        // Update existing question
        const index = questions.findIndex(q => q.id === currentQuestionId);
        if (index !== -1) {
            questions[index] = questionData;
        }
    } else {
        // Add new question
        questions.push(questionData);
    }
    
    saveToLocalStorage();
    hideForm();
    renderQuestions();
}

// Delete a question
function deleteQuestion(id) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== id);
        saveToLocalStorage();
        renderQuestions();
    }
}

// Save questions to localStorage
function saveToLocalStorage() {
    localStorage.setItem('triviaQuestions', JSON.stringify(questions));
}

// Helper functions
function hideForm() {
    questionForm.style.display = 'none';
    resetForm();
}

function resetForm() {
    questionField.value = '';
    correctAnswerField.value = '';
    incorrectAnswersField.value = '';
    difficultyField.value = 'easy';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);