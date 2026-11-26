const SIZE = 10;
const grid = document.getElementById("grid");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const START_SPEED = 300;
const MIN_SPEED = 140;

let cells = [];
let snake;
let direction; // step being walked: 1, -1, SIZE or -SIZE
let nextDirection; // last key pressed, applied on the next tick (stops a double tap reversing into the body)
let appleIndex;
let timer = null;
let over = false;
let score = 0;
let best = 0;
try {
  best = Number(localStorage.getItem("snake_best")) || 0;
} catch (e) {
  /* storage blocked: best score just lasts for this visit */
}
bestEl.textContent = best;

const buildGrid = () => {
  grid.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
  grid.replaceChildren(
    ...Array.from({ length: SIZE * SIZE }, (_, i) => {
      const c = document.createElement("div");
      c.className = (i + Math.floor(i / SIZE)) % 2 ? "cell alt" : "cell"; // checkerboard
      return c;
    })
  );
  cells = [...grid.children];
};

const paintSnake = () => {
  cells.forEach((c) => c.classList.remove("snake", "head"));
  snake.forEach((i) => cells[i].classList.add("snake"));
  cells[snake[0]].classList.add("head");
};

const placeApple = () => {
  const free = cells.map((_, i) => i).filter((i) => !snake.includes(i));
  if (!free.length) return false;
  appleIndex = free[Math.floor(Math.random() * free.length)];
  cells[appleIndex].classList.add("apple");
  return true;
};

const showOverlay = (text, label) => {
  overlayText.textContent = text;
  startBtn.textContent = label;
  overlay.classList.add("show");
};

const startTimer = () => {
  clearInterval(timer);
  timer = setInterval(tick, Math.max(MIN_SPEED, START_SPEED - score * 10));
};

// Sets the board up and waits for the first key, so the snake does not run off before you are ready
const newGame = () => {
  clearInterval(timer);
  timer = null;
  over = false;
  buildGrid();
  grid.classList.remove("dead");
  snake = [3, 2, 1];
  direction = nextDirection = 1;
  score = 0;
  scoreEl.textContent = 0;
  paintSnake();
  placeApple();
  showOverlay("Press a key, swipe or tap Start", "Start");
};

const run = () => {
  if (timer || over) return;
  overlay.classList.remove("show");
  startTimer();
};

const tick = () => {
  direction = nextDirection;
  const head = snake[0];
  const hitsWall =
    (direction === 1 && head % SIZE === SIZE - 1) ||
    (direction === -1 && head % SIZE === 0) ||
    (direction === -SIZE && head < SIZE) ||
    (direction === SIZE && head >= SIZE * (SIZE - 1));
  const next = head + direction;
  // the tail cell is free again this tick unless the snake grows, so it does not count as a hit
  const hitsSelf = !hitsWall && snake.slice(0, -1).includes(next);
  if (hitsWall || hitsSelf) return endGame("Game over");

  snake.unshift(next);
  if (next === appleIndex) {
    cells[appleIndex].classList.remove("apple");
    score++;
    scoreEl.textContent = score;
    if (!placeApple()) {
      paintSnake();
      return endGame("You win!");
    }
    startTimer(); // a little faster after every apple
  } else {
    snake.pop();
  }
  paintSnake();
};

const endGame = (text) => {
  clearInterval(timer);
  timer = null;
  over = true;
  grid.classList.add("dead");
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    try {
      localStorage.setItem("snake_best", best);
    } catch (e) {
      /* storage blocked */
    }
  }
  showOverlay(`${text}. Score: ${score}`, "Play again");
};

const steer = (key) => {
  const d = { W: -SIZE, S: SIZE, A: -1, D: 1 }[key];
  if (d === undefined || over || d === -direction) return false;
  nextDirection = d;
  run();
  return true;
};

const arrows = { ArrowUp: "W", ArrowDown: "S", ArrowLeft: "A", ArrowRight: "D" };
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (steer(arrows[e.key] || e.key.toUpperCase()) && arrows[e.key]) e.preventDefault();
});
["w", "a", "s", "d"].forEach((id) =>
  document.getElementById(id).addEventListener("click", () => steer(id.toUpperCase()))
);

// Swipe on the board (phones)
let touch = null;
grid.addEventListener("touchstart", (e) => (touch = e.touches[0]), { passive: true });
grid.addEventListener("touchend", (e) => {
  if (!touch) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touch.clientX;
  const dy = t.clientY - touch.clientY;
  touch = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "D" : "A") : dy > 0 ? "S" : "W");
});

startBtn.addEventListener("click", () => {
  if (over) newGame();
  run();
});
document.getElementById("resetBtn").addEventListener("click", newGame);

newGame();
