"use strict";

let width = 20;
let height = 20;
let scale = 20;
let speed = 10;
let distance = 0;

let display = document.getElementsByClassName("game")[0];
display.style.width = `${width * scale}px`
display.style.height = `${height * scale}px`

let scoreDiv = document.createElement("div");
display.parentNode.appendChild(scoreDiv);

let tracker = createDirectionTracker();

var State = class State {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.snake = new Snake(Math.floor(width/2), Math.floor(height/2));
        this.food = new Food(Math.floor(width*Math.random()), Math.floor(height*Math.random()));
        this.score = 0;
    }

    update() {
        if (this.snake.collision()) {
            this.reset();
        }
        // if snake is about to hit food then turn food into new snake and append current snake
        else if (this.snake.x + tracker.dx == this.food.x && this.snake.y + tracker.dy == this.food.y) {
            this.snake.eatFood(this.food);
            this.food = new Food(Math.floor(width*Math.random()), Math.floor(height*Math.random()));
            this.score += 1;
        } else {
            this.snake.update();
        }
    }

    reset() {
        this.snake.remove();
        this.food.remove();
        this.initialize();
    }

    draw() {
        this.snake.draw();
        scoreDiv.innerHTML = this.score;
    }
}

var Snake = class Snake {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.head = new SnakePart(x, y);
        this.draw();
    }

    update() {
        this.x = this.x + tracker.dx;
        this.y = this.y + tracker.dy;
        this.head.update(this.x, this.y);
    }

    eatFood(food) {
        let newHead = new SnakePart(food.x, food.y);
        newHead.next = this.head;
        this.head = newHead;
        this.x = this.head.x;
        this.y = this.head.y;
        food.remove();
    }

    // check if particular x, y coordinates contain snake
    isSnake(x, y) {
        return this.head.isSnake(x, y);
    }

    collision() {
        let nextX = this.x + tracker.dx;
        let nextY = this.y + tracker.dy;
        if ((nextX < 0 || nextX >= width) || (nextY < 0 || nextY >= height)) {
            return true;
        } else if (this.isSnake(nextX, nextY)) {
            return true;
        }
        else {
            return false;
        }
    }

    remove() {
        this.head.remove()
    }

    draw() {
        this.head.draw();
    }
}

var SnakePart = class SnakePart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.next = null;
        this.dom = this.createDom();
        display.append(this.dom);
    }

    createDom() {
        let dom = document.createElement("div");
        dom.className = "snake";
        dom.style.width = `${scale}px`;
        dom.style.height = `${scale}px`;
        return dom;
    }

    update(x, y) {
        if (this.next) {
            this.next.update(this.x, this.y);
        }
        this.x = x;
        this.y = y;
    }

    isSnake(x, y) {
        if (this.x == x && this.y == y) {
            return true;
        } else if (this.next) {
            return this.next.isSnake(x, y);
        } else {
            return false;
        }
    }

    remove() {
        this.dom.remove();
        if (this.next) {
            this.next.remove();
        }
    }

    draw() {
        this.dom.style.left = `${this.x * scale}px`;
        this.dom.style.top = `${this.y * scale}px`;
        if (this.next) {
            this.next.draw();
        }
    }
}

var Food = class food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dom = this.createDom();
        display.append(this.dom);
        this.draw();
    }

    createDom() {
        let dom = document.createElement("div");
        dom.className = "food"
        dom.style.width = `${scale}px`;
        dom.style.height = `${scale}px`;
        return dom;
    }
 
    draw() {
        this.dom.style.left = `${this.x * scale}px`;
        this.dom.style.top = `${this.y * scale}px`;
    }

    remove() {
        this.dom.remove();
    }
}

function createDirectionTracker() {
    let tracker = Object.create(null);
    tracker["dx"] = 1;
    tracker["dy"] = 0;
    function track(event) {
        if (event.key == "ArrowLeft" && tracker["dx"] == 0) {
            tracker["dx"] = -1;
            tracker["dy"] = 0;
            event.preventDefault();
        } else if (event.key == "ArrowRight" && tracker["dx"] == 0) {
            tracker["dx"] = 1;
            tracker["dy"] = 0;
            event.preventDefault();
        } else if (event.key == "ArrowUp" && tracker["dy"] == 0) {
            tracker["dx"] = 0;
            tracker["dy"] = -1;
            event.preventDefault();
        } else if (event.key == "ArrowDown" && tracker["dy"] == 0) {
            tracker["dx"] = 0;
            tracker["dy"] = 1;
            event.preventDefault();
        }
    }
    window.addEventListener("keydown", track);
    return tracker;
}

function step(timeStep, state) {
    distance += timeStep*speed;
    if (distance >= 1) {
        state.update();
        state.draw();
        distance -= 1;
    }
}

function runAnimation(state) {
    let lastTime = null;
    function frame(time) {
        if (lastTime != null) {
            let timeStep = Math.min(time - lastTime, 100)/1000;
            step(timeStep, state);
        }
        lastTime = time;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function main() {
    let state = new State();
    let lastTime = null;
    runAnimation(state);
}

main();