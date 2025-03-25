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