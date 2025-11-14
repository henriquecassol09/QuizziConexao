import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyA5JoZUD5ZF-Ii2jdX6LEDlhAZRoPF1L5Q",
    authDomain: "quizziconexao.firebaseapp.com",
    projectId: "quizziconexao",
    storageBucket: "quizziconexao.firebasestorage.app",
    messagingSenderId: "671901306674",
    appId: "1:671901306674:web:f08ba9077249bb581d512b",
    measurementId: "G-01G2VY3WPM"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const questionsOriginal = [
    {
        question: "Qual ferramenta é comumente usada para criar um pendrive bootável?",
        options: ["PowerISO", "Autocad", "Rufus", "Steam"],
        correctAnswer: "Rufus"
    },
    {
        question: "Como se faz para acessar a BIOS/UEFI em um computador comum?",
        options: [
            "Ligo o computador e aperto a tecla F2/Delete até abrir a BIOS (correta)", 
            "Aperte Ctrl + Windows + Shift + B", 
            "Ligo o computador e seguro a tecla Windows", 
            "Aperte Windows + Delete quando ligar o PC"
        ],
        correctAnswer: "Ligo o computador e aperto a tecla F2/Delete até abrir a BIOS (correta)"
    },
    {
        question: "O que é necessário configurar na BIOS/UEFI antes de iniciar uma formatação via pendrive?",
        options: [
            "Ativar a formatação automática, deixando o Windows na versão mais atualizada", 
            "Alterar a ordem de boot para iniciar pelo pendrive", 
            "Aumentar a velocidade das fans", 
            "Ativar a hibernação"
        ],
        correctAnswer: "Alterar a ordem de boot para iniciar pelo pendrive"
    },
    {
        question: "O que pode acontecer se o computador for desligado durante a formatação?",
        options: [
            "O sistema será reinstalado automaticamente", 
            "O HD pode corromper dados e o sistema não iniciará", 
            "O Windows será restaurado ao estado anterior", 
            "A instalação tem que ser refeita do zero"
        ],
        correctAnswer: "O HD pode corromper dados e o sistema não iniciará"
    },
    {
        question: "1) qual a principal diferença entre o padrão A e o padrão B",
        options: ["o cabo azul troca de lugar com o verde",
             "o cabo verde e branco do verde trocam de lugar com o laranja e braco do laranja",
              "o cabo laranja troca de lugar com o branco do azul", 
              "a ordem dos cabos fica ao contrário"],
        correctAnswer: "o cabo verde e branco do verde trocam de lugar com o laranja e braco do laranja"
    },
    {
        question: "qual o nome do conector dos cabos de rede?",
      options: ["RJ11", "HDMI", "RJ47", "RJ45"],
        correctAnswer: "RJ45"
    },
    {
        question: " Qual a principal diferença do cabo com blindagem (STP) para o cabo sem blindagem (UTP)",
        options: ["o com blindagem tem maior resistência eletromagnetica e ao clima",
             "Velocidade de internet que é maior no sem blindagem, pois como ele é menos custoso seu valor é revertido na qualidade",
             "nenhuma das alternativas acima",
              "o cabo sem blindagem não funciona quando esta chovendo, para não danificar a integidade do mesmo"],
        correctAnswer: "o com blindagem tem maior resistência eletromagnetica e ao clima"
    },
    {
        question: "qual a ordem coreta dos cabos no padrão B?",
        options: ["branco verde, verde, branco laranja, azul, laranja, branco marrom, marom",
             "azul, branco verde, verde, branco azul, marrom, laranja, branco laranja, branco marrom",
              "branco laraja, laranja, branco verde, azul, branco azul, verde, branco marrom, marrom",
               "branco laraja, laranja, branco azul, verde, branco verde, azul, marrom, branco marrom"],
        correctAnswer: "branco laraja, laranja, branco verde, azul, branco azul, verde, branco marrom, marrom"
    },
    {
        question: "Por que o braço robótico precisa de motores nas juntas?",
        options: ["Para fazer o braco se mover de forma controlada", "1969", "1971", "1975"],
        correctAnswer: "Para fazer o braco se mover de forma controlada"
    },
    {
        question: "O que acontece se o carrinho robótico não tiver sensoros?",
        options: ["Ele não consegue detectar obstáculos", "8", "9", "11"],
        correctAnswer: "Ele não consegue detectar obstáculos"
    },
    {
        question: "Qual é a funcão do Arduina (ou placa controladora) em um roha?",
        options: ["Processar comandos e controlar componentes", "Índico", "Ártico", "Pacífico"],
        correctAnswer: "Processar comandos e controlar componentes"
    },
    {
        question: "Oque faz o servo motor em um braço robótico?",
        options: ["Controla a posição com precisão", "Alemanha", "França", "Espanha"],
        correctAnswer: "Controla a posição com precisão"
    },
    {
        question: "O que é um 'byte' na informática?",
        options: ["Uma linguagem de programação", "Um conjunto de 8 bits", "Um tipo de vírus", "Um hardware"],
        correctAnswer: "Um conjunto de 8 bits"
    },
    {
        question: "Qual das seguintes não é uma linguagem de programação?",
        options: ["Python", "Java", "HTML", "C#"],
        correctAnswer: "HTML"
    },
    {
        question: "A sigla RAM significa:",
        options: ["Read Access Memory", "Random Access Memory", "Run All Memory", "Ready Application Module"],
        correctAnswer: "Random Access Memory"
    }
];

let questions = [];

let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;
let timerInterval = null;
let timeRemaining = 420;
let quizResultId = null;
let userRating = 0;

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startQuizBtn = document.getElementById('start-quiz-btn');

const timerMinutes = document.getElementById('timer-minutes');
const timerSeconds = document.getElementById('timer-seconds');
const timerContainer = document.querySelector('.timer-container');

const currentQuestionSpan = document.getElementById('current-question');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const feedbackContainer = document.getElementById('feedback-container');
const feedbackMessage = document.getElementById('feedback-message');
const nextQuestionBtn = document.getElementById('next-question-btn');

const finalMessage = document.getElementById('final-message');
const scoreDisplay = document.getElementById('score-display');
const percentageDisplay = document.getElementById('percentage-display');
const restartQuizBtn = document.getElementById('restart-quiz-btn');

const starsContainer = document.getElementById('stars-container');
const ratingFeedback = document.getElementById('rating-feedback');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0')
    };
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        
        const time = formatTime(timeRemaining);
        timerMinutes.textContent = time.minutes;
        timerSeconds.textContent = time.seconds;
        
        if (timeRemaining <= 60) {
            timerContainer.classList.add('timer-danger');
        } else if (timeRemaining <= 120) {
            timerContainer.classList.add('timer-warning');
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    showResult();
}

function showScreen(screenToShow) {
    const screens = [startScreen, quizScreen, resultScreen];
    screens.forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

function loadQuestion() {
    isAnswered = false;
    feedbackContainer.classList.add('hidden');
    
    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }

    const currentQ = questions[currentQuestionIndex];
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    questionText.textContent = currentQ.question;
    optionsContainer.innerHTML = '';

    const shuffledOptions = shuffleArray(currentQ.options);

    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(button, option, currentQ.correctAnswer));
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedButton, selectedAnswer, correctAnswer) {
    if (isAnswered) return;

    isAnswered = true;
    const isCorrect = selectedAnswer === correctAnswer;

    const allOptions = optionsContainer.querySelectorAll('.option-btn');
    allOptions.forEach(btn => {
        btn.classList.add('disabled');
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
            if (btn === selectedButton) {
                 const feedback = document.createElement('span');
                 feedback.classList.add('feedback-text', 'correct');
                 feedback.textContent = 'Acertou!';
                 btn.appendChild(feedback);
            }
        } else if (btn === selectedButton) {
            btn.classList.add('wrong');
            const feedback = document.createElement('span');
            feedback.classList.add('feedback-text', 'wrong');
            feedback.textContent = 'Errado!';
            btn.appendChild(feedback);
        }
    });

    if (isCorrect) {
        score++;
        feedbackMessage.textContent = "Parabéns, você acertou!";
    } else {
        feedbackMessage.textContent = "Ops, essa não foi a correta.";
        const correctButton = Array.from(allOptions).find(btn => btn.textContent === correctAnswer);
        if(correctButton) {
             const feedback = document.createElement('span');
             feedback.classList.add('feedback-text', 'correct');
             feedback.textContent = 'Correta!';
             correctButton.appendChild(feedback);
        }
    }

    feedbackContainer.classList.remove('hidden');
}

async function saveResultToFirebase(score, percentage) {
    try {
        const docRef = await addDoc(collection(db, 'quiz_results'), {
            score: score,
            totalQuestions: questions.length,
            percentage: percentage,
            timestamp: serverTimestamp()
        });
        console.log("Resultado salvo com ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        return null;
    }
}

async function saveRatingToFirebase(rating) {
    try {
        await addDoc(collection(db, 'quiz_ratings'), {
            rating: rating,
            timestamp: serverTimestamp()
        });
        console.log("Avaliação salva:", rating);
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
    }
}

async function showResult() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const totalQuestions = questions.length;
    const percentage = (score / totalQuestions) * 100;
    const percentageRounded = percentage.toFixed(0);

    let resultMessage = "";

    if (percentage === 100) {
        resultMessage = `🏆 Uau! Você realmente entendeu tudo! Você ganhou todos os prêmios, parabéns! Obrigada por jogar!`;
    } else if (percentage >= 80) {
        resultMessage = `🎉 Parabéns! Parece que você entendeu mesmo, acertou mais de 80%! Você ganhou um BomBom e uma bala! Obrigada por jogar!`;
    } else if (percentage >= 65) {
        resultMessage = `👍 Parabéns! Você acertou mais de 65%! Seu prêmio é um bombom! Obrigada por jogar!`;
    } else {
        resultMessage = `📚 Que pena, você acertou menos de 65%, infelizmente você não vai ganhar brinde, tente novamente se quiser um BomBom, obrigada por jogar!`;
    }

    finalMessage.textContent = resultMessage;
    scoreDisplay.textContent = score;
    percentageDisplay.textContent = `${percentageRounded}%`;

    quizResultId = await saveResultToFirebase(score, percentageRounded);

    userRating = 0;
    ratingFeedback.classList.add('hidden');
    const stars = starsContainer.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('active'));

    showScreen(resultScreen);
}

starsContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('star')) {
        const rating = parseInt(e.target.dataset.rating);
        userRating = rating;
        
        const stars = starsContainer.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        ratingFeedback.classList.remove('hidden');
        await saveRatingToFirebase(rating);
    }
});

startQuizBtn.addEventListener('click', () => {
    questions = shuffleArray(questionsOriginal).map(q => ({
        ...q,
        options: [...q.options]
    }));
    
    currentQuestionIndex = 0;
    score = 0;
    timeRemaining = 420;
    timerContainer.classList.remove('timer-warning', 'timer-danger');
    showScreen(quizScreen);
    loadQuestion();
    startTimer();
});

nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

restartQuizBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    timeRemaining = 420;
    timerContainer.classList.remove('timer-warning', 'timer-danger');
    showScreen(startScreen);
});

document.addEventListener('DOMContentLoaded', () => {
    showScreen(startScreen);
});
