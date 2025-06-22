/* ---------- seleção de elementos ---------- */
const cells           = document.querySelectorAll('[data-cell]');
const winningMessage  = document.getElementById('winningMessage');
const messageText     = document.getElementById('messageText');
const restartButton   = document.getElementById('restartButton');

const chatbot = document.getElementById('chatbot');

const frases = [
  "Vou ganhar essa fácil! 🤖",
  "Cuidado, humano! Estou só começando... 👾",
  "Quase lá... Será que você consegue? 😏",
  "Haha, boa jogada! Mas não vai ser suficiente! 💥",
  "Opa, essa foi por pouco! 😅",
  "Não subestime o poder do bot! 🔥",
  "Tente de novo, eu tô preparado! 💪",
  "Você está ficando bom nisso! Mas eu também! 😎",
  "Não adianta chorar depois! 😂",
  "Eu aprendo rápido, viu? 🤓"
];

function mostrarFrase() {
  const frase = frases[Math.floor(Math.random() * frases.length)];
  chatbot.innerText = frase;
  chatbot.classList.add('show');
  setTimeout(() => chatbot.classList.remove('show'), 3500);
}


/* ---------- constantes ---------- */
const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

/* ---------- variáveis de estado ---------- */
let gameActive = true;
let timer;          // id do setInterval
let timeLeft = 5;   // segundos por jogada

/* ---------- inicialização ---------- */
startGame();
restartButton.addEventListener('click', startGame);

/* ---------- fluxo principal ---------- */
function startGame() {
  gameActive = true;
  clearInterval(timer);
  startTimer();

  cells.forEach(cell => {
    cell.classList.remove('x', 'o');
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
  });

  winningMessage.classList.remove('show');
}

function handleClick(e) {
  if (!gameActive) return;

  const cell = e.target;
  placeMark(cell, 'x');

  mostrarFrase();//chatbot 

  if (checkWin('x')) return endGame(false, 'X');
  if (isDraw())      return endGame(true);

  setTimeout(botMove, 500);          // pequena pausa “pensando”
}

function botMove() {
  if (!gameActive) return;

  const difficulty = document.getElementById('difficulty').value;
  let move;

  if (difficulty === 'easy') {
    // Movimento aleatório
    const free = [...cells].filter(c => !c.classList.contains('x') && !c.classList.contains('o'));
    move = free[Math.floor(Math.random() * free.length)];
  } 
  else if (difficulty === 'medium') {
    move = getMediumBotMove();
  } 
  else if (difficulty === 'hard') {
    move = getBestMove('o'); // Minimax
  }

  if (!move) return; // segurança
  placeMark(move, 'o');

  if (checkWin('o')) return endGame(false, 'O');
  if (isDraw()) return endGame(true);

  startTimer();
}
/*medio */
function getMediumBotMove() {
  // Tenta ganhar
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains('x') && !cells[i].classList.contains('o')) {
      cells[i].classList.add('o');
      if (checkWin('o')) {
        cells[i].classList.remove('o');
        return cells[i];
      }
      cells[i].classList.remove('o');
    }
  }

  // Tenta bloquear
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains('x') && !cells[i].classList.contains('o')) {
      cells[i].classList.add('x');
      if (checkWin('x')) {
        cells[i].classList.remove('x');
        return cells[i];
      }
      cells[i].classList.remove('x');
    }
  }

  // Senão, aleatório
  const free = [...cells].filter(c => !c.classList.contains('x') && !c.classList.contains('o'));
  return free[Math.floor(Math.random() * free.length)];
}
/*--------hard ---------------------*/
function getBestMove(player) {
  let bestScore = -Infinity;
  let move;
  cells.forEach((cell, index) => {
    if (!cell.classList.contains('x') && !cell.classList.contains('o')) {
      cell.classList.add(player);
      let score = minimax(0, false);
      cell.classList.remove(player);
      if (score > bestScore) {
        bestScore = score;
        move = cell;
      }
    }
  });
  return move;
}

function minimax(depth, isMaximizing) {
  if (checkWin('o')) return 10 - depth;
  if (checkWin('x')) return depth - 10;
  if (isDraw()) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    cells.forEach(cell => {
      if (!cell.classList.contains('x') && !cell.classList.contains('o')) {
        cell.classList.add('o');
        let score = minimax(depth + 1, false);
        cell.classList.remove('o');
        bestScore = Math.max(score, bestScore);
      }
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    cells.forEach(cell => {
      if (!cell.classList.contains('x') && !cell.classList.contains('o')) {
        cell.classList.add('x');
        let score = minimax(depth + 1, true);
        cell.classList.remove('x');
        bestScore = Math.min(score, bestScore);
      }
    });
    return bestScore;
  }
}

/* ---------- utilidades ---------- */
function placeMark(cell, mark) {
  clearInterval(timer);              // zera cronômetro do turno anterior
  cell.classList.add(mark);
  cell.removeEventListener('click', handleClick);
}

function checkWin(mark) {
  return WIN_COMBOS.some(combo =>
    combo.every(idx => cells[idx].classList.contains(mark))
  );
}

function isDraw() {
  return [...cells].every(cell =>
    cell.classList.contains('x') || cell.classList.contains('o')
  );
}

function endGame(draw, winner = '') {
  gameActive = false;
  clearInterval(timer);

  messageText.textContent = draw
    ? 'Empate! 😐'
    : `${winner} Venceu! 🎉`;

  winningMessage.classList.add('show');
}

function startTimer() {
  timeLeft = 5;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft === 0) {
      clearInterval(timer);
      alert('Tempo esgotado! Bot jogará.');
      botMove();
    }
  }, 1000);
}
