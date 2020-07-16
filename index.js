const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const scoreDiv = document.getElementById('score')
const timerDiv = document.getElementById('timer')
const pauseButton = document.getElementById('pause-button')
const newGameButtonId = document.getElementById('new-game')

let score = 0
let timer = 0
let paused = false
let level = 1
let width = 300
let height = 300
let start = Date.now()
let paddleSize = width / 6
let paddlePos = width / 2
let paddleHeight = height / 43
let speed = width / 75
let dir
let ballX = paddlePos
let ballRadius = height / 100
let ballY = height - ballRadius - paddleHeight
let arrow = false
let ballSpeed = height / 100
let ballYSpeed = 0
let ballXSpeed = 0
let ballYDir = -1
let ballXDir = 1
let brickWidth = width / 10
let brickHeight = height / 20
let bricksInARow = 0
let lastBrick
let newGameButton = {
    x: width / 2 - width / 8,
    y: height * 3 / 4 - height / 20,
    width: width / 4,
    height: height / 10
}
let fadeOut

const levels = []

const bricks = []

function setMeasurements(newWidth, newHeight) {
    canvas.height = height = newHeight
    canvas.width = width = newWidth
    paddleHeight = height / 43
    paddleSize = width / 6
    ballRadius = height / 100
    brickWidth = width / 10
    brickHeight = height / 20
    speed = width / 75
    ballSpeed = height / 100
} 

setMeasurements(width, height)

class Brick {
    constructor(x, y, color, fire) {
        this.x = x,
        this.y = y
        this.color = color
        this.fire = fire
    }
}

function makeBrick(x, y, color, fire) {
    bricks.push(new Brick(x, y, color, fire))
}

levels.push(() => {
    for (let i = brickWidth; i < width - brickWidth; i += brickWidth) {
        for (let j = 3 * brickHeight; j < brickHeight * 7; j +=  3 * brickHeight) {
            makeBrick(i, j, 'green')
        }
    }
})

levels.push(function () {
    for (let i = 0; i < width; i += brickWidth) {
        for (let j = 0; j < height / 3; j += brickHeight) {
            makeBrick(i, j, 'lightblue')
        }
    }
})

levels.push((function() {
    for (let i = 0; i < width; i+= brickWidth) {
        for (let j = 0; j < height / 2; j += brickHeight) {
            if ((i + j) % 2) makeBrick(i, j, 'red', true)
            else makeBrick(i, j, 'yellow')
        }
    }
}))

function drawBrick(x, y, color) {
    ctx.fillStyle = color
    ctx.fillRect(x + 1, y + 1, brickWidth - 1, brickHeight - 1)
}

canvas.width = width
canvas.height = height

function drawPaddle() {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = 'red'
    ctx.fillRect(paddlePos - paddleSize / 2, height - paddleHeight, paddleSize, paddleHeight)
}

function drawBall() {
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
}

let game

const playGame = () => {
    const currTime = Math.floor((Date.now() - start) / 1000)
    if (currTime - lastBrick / 1000 > 1) bricksInARow = 0
    if (!bricks.length) endGame('YOU WON!')
    scoreDiv.innerText = `score: ${score}`
    // if (currTime > timer)  {
    //     timer = currTime
    //     timerDiv.innerText = timer
    // }
    if (dir < 0 && paddlePos < paddleSize / 2 || dir > 0 && paddlePos > width - paddleSize / 2) arrow = false
    if (arrow) paddlePos += dir * speed
    ballX += ballXSpeed * ballXDir
    ballY += ballYSpeed * ballYDir
    if (ballX >= width - ballRadius) ballXDir = -1
    if (ballX <= ballRadius) ballXDir = 1
    if (ballY <= ballRadius) ballYDir = 1
    if (ballY >= height - paddleHeight - ballRadius && ballX >= paddlePos - paddleSize / 2 - ballRadius && ballX <= paddlePos + paddleSize / 2 + ballRadius) {
        const angle = (ballX - paddlePos) / width * 10 + Math.random() * .004 - .002
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        if (sin < 0) ballXDir = -1
        else ballXDir = 1
        ballYDir = -1
        ballXSpeed = Math.abs(sin) * ballSpeed
        ballYSpeed = Math.abs(cos) * ballSpeed
    }
    if (ballY > height + ballRadius) endGame('GAME OVER')
    drawPaddle()
    drawBall()
    let fire = false
    for (let i = 0; i < bricks.length; i++) {
        drawBrick(bricks[i].x, bricks[i].y, bricks[i].color)
        if (ballX >= bricks[i].x && ballX <= bricks[i].x + brickWidth && ballY >= bricks[i].y && ballY <= bricks[i].y + brickHeight) {
            if (ballX > bricks[i].x + 1 && ballX < bricks[i].x + brickWidth - 1) {
                if (ballY < bricks[i].y + brickHeight / 2) ballYDir = -1
                else ballYDir = 1
            }
            else if (ballY > bricks[i].y + 1 && ballY < bricks[i].y + brickHeight -1) {
                if (ballX < bricks[i].x + brickWidth / 2) ballXDir = -1
                else ballXDir = 1
            }
            else {
                if (ballY < bricks[i].y + brickHeight / 2) ballYDir = -1
                else ballYDir = 1
                if (ballX < bricks[i].x + brickWidth / 2) ballXDir = -1
                else ballXDir = 1
            }
            if (bricks[i].fire) fire = true
            bricks.splice(i, 1)
            bricksInARow++
            lastBrick = Date.now() - start
            score += bricksInARow * 10
            i--
        }
    }
    if (fire) endGame('GAME OVER')
}

const pauseListener = () => {
    if (!paused) {
        timePaused = Date.now()
        clearInterval(game)
        pauseButton.innerText = 'PLAY'
    } else {
        timePaused = Date.now() - timePaused
        start += timePaused
        lastBrick += timePaused
        game = setInterval(playGame, 16)
        pauseButton.innerText = 'PAUSE'
    }
    paused = !paused
}

function newGame() {
    bricks.length = 0
    setMeasurements(width, height)
    clearInterval(fadeOut)
    pauseButton.addEventListener('click', pauseListener)
    pauseButton.innerText = 'PAUSE'
    pauseButton.style.display = ''
    score = 0
    timer = 0
    // timerDiv.innerText = timer
    clearInterval(game)
    paddlePos = width / 2
    ballY = height - ballRadius - paddleHeight
    ballX = paddlePos
    ballYDir = -1
    ballXDir = 1
    ballSpeed = height / 100
    speed = width / 75
    start = Date.now()
    ballYSpeed = ballSpeed
    ballXSpeed = 0
    drawPaddle()
    drawBall()
    levels[level - 1]()
    game = setInterval(playGame, 16)
}

newGame()

window.addEventListener('keydown', evt => {
    if (evt.key === 'ArrowRight') dir = 1
    else if (evt.key === 'ArrowLeft') dir = -1
    else return
    arrow = evt.key
})

window.addEventListener('keyup', evt => {
    if (evt.key !== arrow) return
    arrow = false
})

function endGame(state) {
    if (state === 'YOU WON!' && level < levels.length) level++
    const startNewGame = evt => {
        const rect = canvas.getBoundingClientRect()
        const x = evt.clientX - rect.left
        const y = evt.clientY - rect.top
        if (x > newGameButton.x && x < newGameButton.width + newGameButton.x && y > newGameButton.y && y < newGameButton.y + newGameButton.height) {
            newGame()
            window.removeEventListener('click', startNewGame)
        }
    }
    window.addEventListener('click', startNewGame)
    clearInterval(game)
    let canvasData = ctx.getImageData(0, 0, width, height).data
    fadeOut = setInterval(() => {
        for (let i = 0; i < canvasData.length; i++) {
            if (i % 4 !== 3) {
                if (canvasData[i] >= 0) canvasData[i] -= 2
            }
            else canvasData[i] = 255
        }
        ctx.putImageData(new ImageData(canvasData, width, height), 0, 0)
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.font = "40px Comic Sans MS"
        ctx.fillText(state, width / 2, height / 2)
        ctx.fillStyle = 'gray'
        ctx.fillRect(newGameButton.x, newGameButton.y, newGameButton.width, newGameButton.height)
        ctx.font = '10px Comic Sans MS'
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.fillText('NEW GAME', width / 2, height * 3 / 4)
    }, 1)
    setTimeout(() => clearInterval(fadeOut), 300)
    pauseButton.innerText = ''
    pauseButton.removeEventListener('click', pauseListener)
    pauseButton.style.display = 'none'
}

let timePaused

pauseButton.addEventListener('click', pauseListener)