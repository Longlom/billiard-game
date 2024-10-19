import Ball from "./entities/ball";
import Table from "./entities/table";

export type BilliardWorld = {
  canvas: HTMLCanvasElement;
  table: Table;
};

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const angleInput = document.getElementById("angle") as HTMLInputElement;
const forceInput = document.getElementById("force") as HTMLInputElement;
const strikeButton = document.getElementById("strike") as HTMLButtonElement;

const table = new Table(800, 400, 10, "#006400");

const world: BilliardWorld = { canvas, table };

const holes = [
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

function isColliding(ball1: Ball, ball2: Ball) {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ball1.radius + ball2.radius;
}

function resolveCollision(ball1: Ball, ball2: Ball) {
  const xVelocityDiff = ball1.dx - ball2.dx;
  const yVelocityDiff = ball1.dy - ball2.dy;

  const xDistance = ball2.x - ball1.x;
  const yDistace = ball2.y - ball1.y;

  if (xVelocityDiff * xDistance + yVelocityDiff * yDistace >= 0) {
    // Get angle of collision
    const angle = -Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);

    // Velocity before collision
    const u1 = rotate({ x: ball1.dx, y: ball1.dy }, angle);
    const u2 = rotate({ x: ball2.dx, y: ball2.dy }, angle);

    // Velocity after collision (elastic collision equations)
    const v1 = { x: u2.x, y: u1.y };
    const v2 = { x: u1.x, y: u2.y };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Update velocities
    ball1.dx = vFinal1.x;
    ball1.dy = vFinal1.y;
    ball2.dx = vFinal2.x;
    ball2.dy = vFinal2.y;
  }
}

function rotate(velocity: { x: number; y: number }, angle: number) {
  return {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };
}

function createInitialBalls(startX: number, startY: number) {
  const balls: Ball[] = [];
  const spacing = 2 * 10 + 5;

  let rowNum = 1;
  let offsetY = 0;

  balls.push(new Ball(startX, startY, world));

  rowNum = 2;
  offsetY = spacing / 2;
  balls.push(new Ball(startX + spacing, startY + offsetY, world));
  balls.push(new Ball(startX + spacing, startY - offsetY, world));

  rowNum = 3;
  offsetY = spacing;
  for (let i = 0; i < rowNum; i++) {
    balls.push(
      new Ball(startX + 2 * spacing, startY - offsetY + i * spacing, world)
    );
  }

  rowNum = 4;
  offsetY = spacing * 1.5;
  for (let i = 0; i < rowNum; i++) {
    balls.push(
      new Ball(startX + 3 * spacing, startY - offsetY + i * spacing, world)
    );
  }

  rowNum = 5;
  offsetY = spacing * 2;
  for (let i = 0; i < rowNum; i++) {
    balls.push(
      new Ball(startX + 4 * spacing, startY - offsetY + i * spacing, world)
    );
  }

  return balls;
}

let balls: Ball[] = createInitialBalls(
  canvas.width / 2 + 150,
  canvas.height / 2
);

const cueBall = new Ball(
  canvas.width / 2 - 250,
  canvas.height / 2,
  world,
  "#FFFFFF"
);

function drawTable() {
  ctx.fillStyle = table.color;
  ctx.fillRect(table.padding, table.padding, table.width, table.height);
}

function drawHoles() {
  holes.forEach((hole) => {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
  });
}

function drawCueStick() {
  const angle = Number(angleInput.value);
  const radians = (angle * Math.PI) / 180;

  const cueStartX = cueBall.x - Math.cos(radians) * 15;
  const cueStartY = cueBall.y - Math.sin(radians) * 15;

  const cueEndX = cueStartX - Math.cos(radians) * 100;
  const cueEndY = cueStartY - Math.sin(radians) * 100;

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
  const allBalls = [cueBall, ...balls];
  return allBalls.every(
    (ball) => Math.abs(ball.dx) < 0.01 && Math.abs(ball.dy) < 0.01
  );
}

function update() {
  displayInputValues();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTable();
  drawHoles();
  balls.forEach((ball) => ball.update());
  cueBall.update();

  const allBalls = [cueBall, ...balls];
  for (let i = 0; i < allBalls.length; i++) {
    const ballToCollide = allBalls[i];
    for (let j = i + 1; j < allBalls.length; j++) {
      const ball2 = allBalls[j];
      if (isColliding(ballToCollide, ball2)) {
        resolveCollision(ballToCollide, ball2);
      }
    }
  }

  // Check for pocketing
  [cueBall, ...balls].forEach((ball) => {
    if (isBallInHole(ball)) {
      ball.isPocketed = true;
      if (ball === cueBall) {
        // Handle cue ball pocketing (reset position)
        resetCueBall();
      }
    }
  });

  // Remove pocketed balls from the balls array
  balls = balls.filter((ball) => !ball.isPocketed);

  // Only draw the cue when the balls are stationary
  if (areAllBallsStopped()) {
    drawCueStick();
    angleInput.disabled = false;
    forceInput.disabled = false;
    strikeButton.disabled = false;
  } else {
    angleInput.disabled = true;
    forceInput.disabled = true;
    strikeButton.disabled = true;
  }
}

function strikeBall() {
  if (!areAllBallsStopped()) return;

  const angle = Number(angleInput.value);
  const force = Number(forceInput.value);
  const radians = (angle * Math.PI) / 180;

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
function isBallInHole(ball: Ball) {
  for (const hole of holes) {
    const dx = ball.x - hole.x;
    const dy = ball.y - hole.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
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

angleInput.addEventListener("input", () => {
  if (areAllBallsStopped()) update();
});

forceInput.addEventListener("input", () => {
  displayInputValues();
});

function displayInputValues() {
  const angleValueNode = document.getElementById("angleValue");
  if (angleValueNode) {
    angleValueNode.textContent = angleInput.value;
  }

  const forceValueNode = document.getElementById("forceValue");
  if (forceValueNode) {
    forceValueNode.textContent = forceInput.value;
  }
}

update();
