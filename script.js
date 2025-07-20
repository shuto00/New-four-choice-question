const topScreen = document.getElementById('top-screen');
const app = document.getElementById('app');
const backToTop = document.getElementById('backToTop');

let allQuestions = [];
let currentSet = [];
let currentIndex = 0;
let usedIds = new Set();
let wrongQuestions = [];
let reviewMode = false;
let currentQuestion = null;
let answerLocked = false;
let selectedCount = 0;

fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    allQuestions = data;
    setupTopScreen();
  });

function setupTopScreen() {
  document.querySelectorAll('.start-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = btn.dataset.count;
      selectedCount = count === 'all' ? allQuestions.length : parseInt(count);
      startNewSet();
    });
  });
}

function startNewSet() {
  const remaining = allQuestions.filter(q => !usedIds.has(q.id));
  currentSet = shuffleArray(remaining).slice(0, selectedCount);
  currentSet.forEach(q => usedIds.add(q.id));
  currentIndex = 0;
  wrongQuestions = [];
  reviewMode = false;
  topScreen.style.display = 'none';
  app.style.display = 'block';
  showQuestion();
}

function startReviewSet() {
  currentSet = [...wrongQuestions];
  currentIndex = 0;
  wrongQuestions = [];
  reviewMode = true;
  showQuestion();
}

function showQuestion() {
  if (currentIndex >= currentSet.length) {
    showEnd();
    return;
  }

  answerLocked = false;
  currentQuestion = currentSet[currentIndex];
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

  if (selectedId !== correctId) {
    wrongQuestions.push(currentQuestion);
  }

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
  nextBtn.className = 'start-button';
  nextBtn.style.marginTop = '1rem';
  nextBtn.addEventListener('click', () => {
    currentIndex++;
    showQuestion();
  });
  app.appendChild(nextBtn);
}

function showEnd() {
  let html = '<h2>セット終了！</h2>';
  if (wrongQuestions.length > 0) {
    html += `<p>不正解の問題があります。復習しますか？</p>
      <button id="reviewBtn" class="start-button">復習する</button>
      <button id="nextSetBtn" class="start-button">次の出題</button>`;
  } else {
    html += `<p>次の問題を続けますか？</p>
      <button id="nextSetBtn" class="start-button">次の出題</button>`;
  }
  app.innerHTML = html;

  document.getElementById('nextSetBtn').addEventListener('click', () => {
    startNewSet();
  });

  const reviewBtn = document.getElementById('reviewBtn');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
      startReviewSet();
    });
  }
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

window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = 'このページを離れると出題がリセットされます。よろしいですか？';
});
