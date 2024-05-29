const quizContainer = document.getElementById('quiz-container');
const submitBtn = document.getElementById('submit-btn');

function fetchQuestions() {
  fetch('questions.txt')
    .then(response => response.text())
    .then(data => {
      const questions = data.split('\n');
      buildQuiz(questions);
    });
}

function buildQuiz(questions) {
  questions.forEach(question => {
    const [qText, ...options] = question.split(',');

    const questionEl = document.createElement('div');
    questionEl.classList.add('question');
    questionEl.innerHTML = `<h3>${qText.trim()}</h3>`;

    const isTextAnswer = options.length === 1; // Check if single text answer

    if (isTextAnswer) {
      const answerInput = document.createElement('input');
      answerInput.type = 'text';
      answerInput.id = `q${questions.indexOf(question) + 1}`; // Unique ID
      questionEl.appendChild(answerInput);
    } else {
      const optionsEl = document.createElement('div');
      optionsEl.classList.add('mcq-options');
      options.forEach(option => {
        const optionEl = document.createElement('label');
        optionEl.classList.add('option');
        const isCorrect = option.includes('*');
        const optionText = option.trim().replace('*', '');

        optionEl.innerHTML = `
          <input type="${isTextAnswer ? 'checkbox' : 'radio'}" name="q${questions.indexOf(question) + 1}" value="${optionText}" ${isCorrect ? 'checked' : ''}>
          ${optionText}
        `;

        // Add class for correct or wrong answer based on asterisk
        optionEl.classList.add(isCorrect ? 'correct' : 'wrong');

        optionsEl.appendChild(optionEl);
      });
      questionEl.appendChild(optionsEl);
    }

    quizContainer.appendChild(questionEl);
  });
}

fetchQuestions();

submitBtn.addEventListener('click', () => {
  // Implement logic to handle user selections, calculate score,
  // and potentially highlight correct/wrong answers visually

  const userAnswers = {}; // Store user answers for each question
  const questions = document.querySelectorAll('.question');

  questions.forEach(question => {
    const questionId = question.querySelector('h3').textContent.trim().split(' ')[0].slice(1); // Extract question number
    const userAnswerEl = question.querySelector('input[type="text"]') || question.querySelector('input[type="radio"]:checked'); // Get text input or checked radio button
    userAnswers[questionId] = userAnswerEl ? userAnswerEl.value : ''; // Store user answer

    // Optional: Visually highlight correct/wrong answers (example)    const options = question.querySelectorAll('.option');
    options.forEach(option => {
      if (option.classList.contains('correct') && option.textContent.trim() === userAnswers[questionId]) {
        option.style.color = 'green'; // Visually indicate correct answer
      } else if (option.classList.contains('wrong') && option.textContent.trim() === userAnswers[questionId]) {
        option.style.color = 'red'; // Visually indicate incorrect answer
      }
    });
  });

  // Calculate score based on userAnswers and correct answers from questions.txt
  // (implementation omitted for brevity)

  console.log('User answers:', userAnswers);
  // Display score or any other feedback to the user
});


