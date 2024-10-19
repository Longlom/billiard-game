var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import Ball from "./entities/ball";
import Table from "./entities/table";
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var angleInput = document.getElementById("angle");
var forceInput = document.getElementById("force");
var strikeButton = document.getElementById("strike");
var table = new Table(800, 400, 10, "#006400");
var world = { canvas: canvas, table: table };
var holes = [
    { x: table.padding, y: table.padding, radius: 15 },
    { x: canvas.width / 2, y: table.padding, radius: 15 },
    { x: canvas.width - table.padding, y: table.padding, radius: 15 },
    { x: table.padding, y: canvas.height - table.padding, radius: 15 },
    { x: canvas.width / 2, y: canvas.height - table.padding, radius: 15 },
    {
        x: canvas.width - table.padding,
        y: canvas.height - table.padding,
        radius: 15,
    },
];
// Collision detection between two balls
function isColliding(ball1, ball2) {
    var dx = ball2.x - ball1.x;
    var dy = ball2.y - ball1.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball1.radius + ball2.radius;
}
// Resolve collision between two balls
function resolveCollision(ball1, ball2) {
    var xVelocityDiff = ball1.dx - ball2.dx;
    var yVelocityDiff = ball1.dy - ball2.dy;
    var xDist = ball2.x - ball1.x;
    var yDist = ball2.y - ball1.y;
    // Prevent accidental overlap of balls
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        // Get angle of collision
        var angle = -Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);
        // Velocity before collision
        var u1 = rotate({ x: ball1.dx, y: ball1.dy }, angle);
        var u2 = rotate({ x: ball2.dx, y: ball2.dy }, angle);
        // Velocity after collision (elastic collision equations)
        var v1 = { x: u2.x, y: u1.y };
        var v2 = { x: u1.x, y: u2.y };
        // Final velocity after rotating axis back to original location
        var vFinal1 = rotate(v1, -angle);
        var vFinal2 = rotate(v2, -angle);
        // Update velocities
        ball1.dx = vFinal1.x;
        ball1.dy = vFinal1.y;
        ball2.dx = vFinal2.x;
        ball2.dy = vFinal2.y;
    }
}
function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
    };
}
function createInitialTriangleBalls(startX, startY) {
    var balls = [];
    var spacing = 2 * 10 + 5;
    var rowNum = 1;
    var offsetY = 0;
    balls.push(new Ball(startX, startY, world));
    rowNum = 2;
    offsetY = spacing / 2;
    balls.push(new Ball(startX + spacing, startY + offsetY, world));
    balls.push(new Ball(startX + spacing, startY - offsetY, world));
    rowNum = 3;
    offsetY = spacing;
    for (var i = 0; i < rowNum; i++) {
        balls.push(new Ball(startX + 2 * spacing, startY - offsetY + i * spacing, world));
    }
    rowNum = 4;
    offsetY = spacing * 1.5;
    for (var i = 0; i < rowNum; i++) {
        balls.push(new Ball(startX + 3 * spacing, startY - offsetY + i * spacing, world));
    }
    rowNum = 5;
    offsetY = spacing * 2;
    for (var i = 0; i < rowNum; i++) {
        balls.push(new Ball(startX + 4 * spacing, startY - offsetY + i * spacing, world));
    }
    return balls;
}
var balls = createInitialTriangleBalls(canvas.width / 2 + 150, canvas.height / 2);
// Adding the cue ball in front of the triangle
var cueBall = new Ball(canvas.width / 2 - 250, canvas.height / 2, world, "#FFFFFF");
// Draw the pool table
function drawTable() {
    ctx.fillStyle = table.color;
    ctx.fillRect(table.padding, table.padding, table.width, table.height);
}
// Draw the table holes
function drawHoles() {
    holes.forEach(function (hole) {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.closePath();
    });
}
// Draw pool stick (cue) in the opposite direction of the strike
function drawCue() {
    var angle = Number(angleInput.value);
    var radians = (angle * Math.PI) / 180;
    var cueStartX = cueBall.x - Math.cos(radians) * 15;
    var cueStartY = cueBall.y - Math.sin(radians) * 15;
    var cueEndX = cueStartX - Math.cos(radians) * 100;
    var cueEndY = cueStartY - Math.sin(radians) * 100;
    ctx.beginPath();
    ctx.moveTo(cueStartX, cueStartY);
    ctx.lineTo(cueEndX, cueEndY);
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();
}
// Check if all balls are stopped
function areAllBallsStopped() {
    var allBalls = __spreadArray([cueBall], balls, true);
    return allBalls.every(function (ball) { return Math.abs(ball.dx) < 0.01 && Math.abs(ball.dy) < 0.01; });
}
// Update ball positions and table elements
function update() {
    displayInputValues();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTable();
    drawHoles();
    balls.forEach(function (ball) { return ball.update(); });
    cueBall.update();
    // Check for collisions between all balls
    var allBalls = __spreadArray([cueBall], balls, true);
    for (var i = 0; i < allBalls.length; i++) {
        var ball1 = allBalls[i];
        for (var j = i + 1; j < allBalls.length; j++) {
            var ball2 = allBalls[j];
            if (isColliding(ball1, ball2)) {
                resolveCollision(ball1, ball2);
            }
        }
    }
    // Check for pocketing
    __spreadArray([cueBall], balls, true).forEach(function (ball) {
        if (isBallInHole(ball)) {
            ball.isPocketed = true;
            if (ball === cueBall) {
                // Handle cue ball pocketing (reset position)
                resetCueBall();
            }
        }
    });
    // Remove pocketed balls from the balls array
    balls = balls.filter(function (ball) { return !ball.isPocketed; });
    // Only draw the cue when the balls are stationary
    if (areAllBallsStopped()) {
        drawCue();
        angleInput.disabled = false;
        forceInput.disabled = false;
        strikeButton.disabled = false;
    }
    else {
        angleInput.disabled = true;
        forceInput.disabled = true;
        strikeButton.disabled = true;
    }
}
function strikeBall() {
    if (!areAllBallsStopped())
        return;
    var angle = Number(angleInput.value);
    var force = Number(forceInput.value);
    var radians = (angle * Math.PI) / 180;
    cueBall.dx = Math.cos(radians) * force * 0.1;
    cueBall.dy = Math.sin(radians) * force * 0.1;
    requestAnimationFrame(gameLoop);
}
function gameLoop() {
    update();
    if (!areAllBallsStopped()) {
        requestAnimationFrame(gameLoop);
    }
}
// Check if a ball is in any hole
function isBallInHole(ball) {
    for (var _i = 0, holes_1 = holes; _i < holes_1.length; _i++) {
        var hole = holes_1[_i];
        var dx = ball.x - hole.x;
        var dy = ball.y - hole.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= hole.radius) {
            return true;
        }
    }
    return false;
}
// Reset cue ball position
function resetCueBall() {
    cueBall.x = canvas.width / 2 - 250;
    cueBall.y = canvas.height / 2;
    cueBall.dx = 0;
    cueBall.dy = 0;
    cueBall.isPocketed = false;
}
// Event listeners
strikeButton.addEventListener("click", strikeBall);
angleInput.addEventListener("input", function () {
    if (areAllBallsStopped())
        update();
});
forceInput.addEventListener("input", function () {
    displayInputValues();
});
function displayInputValues() {
    var angleValueNode = document.getElementById("angleValue");
    if (angleValueNode) {
        angleValueNode.textContent = angleInput.value;
    }
    var forceValueNode = document.getElementById("forceValue");
    if (forceValueNode) {
        forceValueNode.textContent = forceInput.value;
    }
}
// Initial render
update();
