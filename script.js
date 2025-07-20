const app = document.getElementById('app');
const backToTop = document.getElementById('backToTop');

let questions = [];
let currentIndex = 0;
let usedQuestions = new Set();
let currentQuestion = null;
let answerLocked = false;

fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    questions = shuffleArray(data);
    showQuestion();
  });

function showQuestion() {
  if (currentIndex >= questions.length) {
    showEnd();
    return;
  }

  answerLocked = false;
  currentQuestion = questions[currentIndex];
  const { question, choices } = currentQuestion;

  app.innerHTML = `
    <h2>Q${currentIndex + 1}</h2>
    <div class="question">${question}</div>
    <div class="choices">
      ${shuffleArray(choices).map(c => `
        <div class="choice" data-id="${c.id}">${c.text}</div>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.choice').forEach(el => {
    el.addEventListener('click', () => handleAnswer(el));
  });
}

function handleAnswer(el) {
  if (answerLocked) return;
  answerLocked = true;

  const selectedId = el.dataset.id;
  const correctId = currentQuestion.answer;

  document.querySelectorAll('.choice').forEach(choice => {
    const id = choice.dataset.id;
    if (id === correctId) {
      choice.classList.add('correct');
    } else if (id === selectedId) {
      choice.classList.add('wrong');
    }
    choice.style.pointerEvents = 'none';
  });

  const explanation = document.createElement('div');
  explanation.className = 'explanation';
  explanation.textContent = currentQuestion.explanation;
  app.appendChild(explanation);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '次の問題へ';
  nextBtn.style.marginTop = '1rem';
  nextBtn.addEventListener('click', () => {
    currentIndex++;
    showQuestion();
  });
  app.appendChild(nextBtn);
}

function showEnd() {
  app.innerHTML = `
    <h2>Congratulations!</h2>
    <p>全ての問題が終了しました。</p>
  `;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

backToTop.addEventListener('click', () => {
  if (confirm('出題がリセットされます。TOPに戻りますか？')) {
    location.reload();
  }
});
