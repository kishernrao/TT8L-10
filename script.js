const pageContainer = document.getElementById('page-container');
const quizContainer = document.getElementById('quiz-container');
const submitBtn = document.getElementById('submit-btn');
let questions = [];
let currentQuestionIndex = 0;

function fetchQuestions() {
  fetch('questions.txt')
    .then(response => response.text())
    .then(data => {
      questions = data.split('\n');
      buildQuiz();
      showQuestion(currentQuestionIndex);
    });
}

function buildQuiz() {
  questions.forEach((question, index) => {
    const parts = question.split(',');
    const qText = parts[0].trim();
    const options = parts.slice(1).map(opt => opt.trim());

    const questionEl = document.createElement('div');
    questionEl.classList.add('question');
    questionEl.setAttribute('data-question-index', index);
    questionEl.innerHTML = `<h3>${qText}</h3>`;

    const optionsEl = document.createElement('div');
    optionsEl.classList.add('mcq-options');

    options.forEach((option) => {
      const optionEl = document.createElement('label');
      optionEl.classList.add('option');

      const isCorrect = option.endsWith('*');
      const optionText = isCorrect ? option.slice(0, -1).trim() : option;

      optionEl.innerHTML = `
        <input type="radio" name="q${index}" value="${optionText}">
        ${optionText}
      `;

      if (isCorrect) {
        optionEl.dataset.correct = true;
      }

      optionsEl.appendChild(optionEl);
    });

    questionEl.appendChild(optionsEl);
    quizContainer.appendChild(questionEl);
  });
}

function showQuestion(index) {
  const questions = document.querySelectorAll('.question');
  questions.forEach((question, idx) => {
    question.style.display = idx === index ? 'block' : 'none';
  });

  if (index === questions.length - 1) {
    submitBtn.style.display = 'block';
    nextBtn.style.display = 'none';
  } else {
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'block';
  }

  if (index === 0) {
    prevBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'block';
  }
}

function checkAnswers() {
  let score = 0;
  const correctAnswers = [];
  const wrongAnswers = [];

  questions.forEach((question, index) => {
    const questionEl = document.querySelector(`.question[data-question-index="${index}"]`);
    const selectedOption = questionEl.querySelector('input[type="radio"]:checked');
    if (selectedOption) {
      const selectedAnswer = selectedOption.value.trim();
      const correctOption = questionEl.querySelector('label[data-correct="true"]');
      const correctAnswer = correctOption ? correctOption.querySelector('input').value.trim() : '';

      if (selectedAnswer === correctAnswer) {
        score++;
        correctAnswers.push(questionEl.querySelector('h3').innerText);
      } else {
        wrongAnswers.push({
          question: questionEl.querySelector('h3').innerText,
          selected: selectedAnswer,
          correct: correctAnswer
        });
      }
    }
  });

  const totalQuestions = questions.length;
  const percentage = ((score / totalQuestions) * 100).toFixed(2);

  pageContainer.classList.add('fade-out');

  setTimeout(() => {
    window.location.href = `summary.html?score=${score}&total=${totalQuestions}&percentage=${percentage}&correct=${encodeURIComponent(JSON.stringify(correctAnswers))}&wrong=${encodeURIComponent(JSON.stringify(wrongAnswers))}`;
  }, 500); 
}

function showNextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    pageContainer.classList.add('fade-out');

    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
      pageContainer.classList.remove('fade-out');
    }, 500); 
  }
}

function showPrevQuestion() {
  if (currentQuestionIndex > 0) {
    pageContainer.classList.add('fade-out');

    setTimeout(() => {
      currentQuestionIndex--;
      showQuestion(currentQuestionIndex);
      pageContainer.classList.remove('fade-out');
    }, 500); 
  }
}

submitBtn.addEventListener('click', checkAnswers);

const nextBtn = document.createElement('button');
nextBtn.innerText = 'Next';
nextBtn.addEventListener('click', showNextQuestion);
nextBtn.style.position = 'fixed';
nextBtn.style.bottom = '20px';
nextBtn.style.right = '20px';
document.body.appendChild(nextBtn);

const prevBtn = document.createElement('button');
prevBtn.innerText = 'Previous';
prevBtn.addEventListener('click', showPrevQuestion);
prevBtn.style.position = 'fixed';
prevBtn.style.bottom = '20px';
prevBtn.style.left = '20px';
document.body.appendChild(prevBtn);

fetchQuestions();













