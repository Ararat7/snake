var score = document.querySelector('.score > span');
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');

var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var FIELD_COLOR = '#FAFAFA';
var SNAKE_COLOR = '#2196F3';
var FOOD_COLOR = '#4CAF50';
var CELL_SIZE = 10;
var SNAKE_LENGTH = 5;
var STEP = 80;
var DIRECTIONS = ['r', 'd', 'l', 'u'];

var dir = 'r';
var snake;
var food;
var timer;
var paused = false;
var counter = 0;
var dirChangeAllowed = true;

canvas.focus();
canvas.addEventListener('blur', pauseGame);
canvas.addEventListener('focus', resumeGame);

init();

function init() {
    score.textContent = counter = 0;
    ctx.fillStyle = FIELD_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    createSnake();
    createFood();
    attachKeyboardEvents();
    attachTouchEvents();
    moveSnake();
}

function pauseGame() {
    timer && clearTimeout(timer);
    paused = true;
}

function resumeGame() {
    paused && moveSnake();
    paused = false;
}

function drawCell(x, y, isFood) {
    ctx.fillStyle = isFood ? FOOD_COLOR : SNAKE_COLOR;
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function clearCell(x, y) {
    ctx.fillStyle = FIELD_COLOR;
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function createSnake() {
    dir = 'r';
    snake = [];
    for (var i = 0; i < SNAKE_LENGTH; i++) {
        snake.push({x: i, y: 0});
        drawCell(i, 0);
    }
}

function createFood() {
    var x = Math.floor(Math.random() * WIDTH / CELL_SIZE);
    var y = Math.floor(Math.random() * HEIGHT / CELL_SIZE);
    var badPosition = snake.some(function (cell) {
        return x === cell.x && y === cell.y;
    });
    if (badPosition) return createFood();
    food = {x: x, y: y};
    drawCell(x, y, true);
}

function moveSnake() {
    if (!snake || !snake.length) throw new Error('There is no snake!');

    var head = snake[snake.length - 1];
    var x = head.x;
    var y = head.y;

    var dirIndex = DIRECTIONS.indexOf(dir);
    if (dirIndex % 2) y += ~dirIndex + 3;
    else x += ~dirIndex + 2;

    var snakeCollision = snake.some(function (cell) {
        return x === cell.x && y === cell.y;
    });
    if (snakeCollision || !~x || !~y || x >= WIDTH / CELL_SIZE || y >= HEIGHT / CELL_SIZE) return init();

    snake.push({x: x, y: y});

    var foodCollision = food && x == food.x && y == food.y;
    if (!foodCollision) {
        var tail = snake.shift();
        clearCell(tail.x, tail.y);
    } else {
        score.textContent = ++counter;
        createFood();
    }

    drawCell(x, y);
    dirChangeAllowed = true;

    timer = setTimeout(moveSnake, STEP);
}

function attachKeyboardEvents() {
    document.removeEventListener('keydown', keydownHandler);
    document.addEventListener('keydown', keydownHandler);
}

function keydownHandler(e) {
    if (!dirChangeAllowed) return;
    dirChangeAllowed = false;

    var key = e.which || e.keyCode || 0;
    if (key == '37' && dir != 'r') dir = 'l';
    else if (key == '38' && dir != 'd') dir = 'u';
    else if (key == '39' && dir != 'l') dir = 'r';
    else if (key == '40' && dir != 'u') dir = 'd';
}

// touch events

var startX;
var startY;
var distX;
var distY;
var threshold = 90;
var restraint = 60;
var allowedTime = 3000;
var elapsedTime;
var startTime;
var swipeDir;

function attachTouchEvents() {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
}

function handleTouchStart(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0];
    swipeDir = null;
    startX = touchobj.pageX;
    startY = touchobj.pageY;
    startTime = new Date().getTime();
}

function handleTouchMove(e) {
    e.preventDefault();
}

function handleTouchEnd(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0];
    distX = touchobj.pageX - startX;
    distY = touchobj.pageY - startY;
    elapsedTime = new Date().getTime() - startTime;
    if (elapsedTime <= allowedTime) {
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
            swipeDir = (distX < 0) ? 'l' : 'r';
        }
        else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
            swipeDir = (distY < 0) ? 'u' : 'd';
        }
    }
    handleSwipe(swipeDir);
}

function handleSwipe(swipedir) {
    if (!swipedir || !dirChangeAllowed) return;
    dirChangeAllowed = false;

    var dirIndex = DIRECTIONS.indexOf(dir);
    var swipeDirIndex = DIRECTIONS.indexOf(swipedir);
    if ((swipeDirIndex - dirIndex) % 2) dir = swipedir;
}