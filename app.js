var amountOfBlocks = 10;
var grid = document.getElementById("grid");
var cells;
var snake;
var direction;
var gameInterval;
var gameSpeed = 300;
var collison = false;
var appleIndex;
var needToGrowThisTurn;

var startGame = () => {
  grid.style.gridTemplateColumns = `repeat(${amountOfBlocks}, 1fr)`;
  for (let i = 0; i < amountOfBlocks; i++) {
    for (let u = 0; u < amountOfBlocks; u++) {
      grid.innerHTML += `<div class="cell"></div>`;
    }
  }

  cells = document.querySelectorAll(".cell");

  snake = [3, 2, 1];
  direction = 1;
  needToGrowThisTurn = false;
  snake.forEach((index) => {
    cells[index].classList.add("snake");
  });

  gameInterval = setInterval(render, gameSpeed);
  appleGen();
};

window.addEventListener("keypress", (e) => {
  keyHandrel(e);
});
var keyHandrel = (e) => {
  let key = e.key.toUpperCase();

  switch (key) {
    case "A":
      if (direction != 1) {
        direction = -1;
      }
      break;
    case "D":
      if (direction != -1) {
        direction = 1;
      }
      break;
    case "W":
      if (direction != amountOfBlocks) direction = -amountOfBlocks;
      break;
    case "S":
      if (direction != -amountOfBlocks) direction = amountOfBlocks;
      break;
  }
};

var render = () => {
  //   console.log("render");
  checkCollision();
  moveSnake();
  checkAppleEat();
};

var moveSnake = () => {
  if (!collison) {
    //   console.log(direction);
    //   console.log(snake[0]);
    let nextCellIndex = snake[0] + direction;
    snake.unshift(nextCellIndex);
    cells[nextCellIndex].classList.add("snake");

    if (!needToGrowThisTurn) {
      let previousCell = cells[snake.pop()];
      previousCell.classList.remove("snake");
    }
  }
  collison = false;
  needToGrowThisTurn = false;
};

var checkCollision = () => {
  //hitiing self
  if (snake.length != new Set(snake).size) {
    console.log("hit self");
    endGame();
  }
  //------------hitiing walls
  //right wall
  if (snake[0] % amountOfBlocks == amountOfBlocks - 1 && direction == 1) {
    endGame("right");
  } //left wall
  else if (snake[0] % amountOfBlocks == 0 && direction == -1) {
    endGame("left");
  } //top wall
  else if (snake[0] - amountOfBlocks < 0 && direction == -amountOfBlocks) {
    console.log("hit top");
    endGame();
  } else if (
    snake[0] + amountOfBlocks >= amountOfBlocks ** 2 &&
    direction == amountOfBlocks
  ) {
    console.log("hit bottom");
    endGame();
  }
};

var appleGen = () => {
  appleIndex = Math.floor(Math.random() * amountOfBlocks ** 2);
  if (snake.includes(appleIndex)) {
    appleGen();
  } else {
    cells[appleIndex].classList.add("apple");
  }
};
var checkAppleEat = () => {
  if (snake[0] == appleIndex) {
    cells[appleIndex].classList.remove("apple");
    needToGrowThisTurn = true;
    appleGen();
  }
};

var endGame = (death) => {
  clearInterval(gameInterval);
  collision = true;

  if (death == "self") {
  } else {
    grid.classList.add(`border-${death}`);
  }
};

startGame();
document.getElementById("resetBtn").addEventListener("click", () => {
  grid.innerHTML = "";
  clearInterval(gameInterval);
  grid.removeAttribute("class");
  startGame();
});
