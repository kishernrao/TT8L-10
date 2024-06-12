const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.post('/add-question', (req, res) => {
  const { questionType, question, options, subjectiveAnswer } = req.body;
  let newQuestion = '';

  if (questionType === 'mcq') {
    newQuestion = `${question}, ${options}\n`;
  } else if (questionType === 'subjective') {
    newQuestion = `SUBJECTIVE: ${question}, ${subjectiveAnswer}\n`;
  }

  fs.appendFile(path.join(__dirname, 'public', 'questions.txt'), newQuestion, (err) => {
    if (err) {
      console.error('Failed to add question:', err);
      res.status(500).send('Failed to add question.');
    } else {
      res.status(200).send('Question added successfully!');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



