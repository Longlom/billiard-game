import Ball from "./entities/ball";
import Table from "./entities/table";
import { isColliding, resolveCollision } from "./physics/collision";

export type BilliardWorld = {
  canvas: HTMLCanvasElement;
  table: Table;
};

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const angleInput = document.getElementById("angle") as HTMLInputElement;
const forceInput = document.getElementById("force") as HTMLInputElement;
const strikeButton = document.getElementById("strike") as HTMLButtonElement;
const hitBallCount = document.getElementById("hitBallCount") as HTMLDivElement;
hitBallCount.textContent = "0";

const table = new Table(800, 400, 10, "#006400", "#654321");
const world: BilliardWorld = { canvas, table };

const holes = [
  { x: table.padding, y: table.padding, radius: 20 },
  { x: table.width / 2 + table.padding, y: table.padding, radius: 20 },
  { x: table.width + table.padding, y: table.padding, radius: 20 },
  { x: table.padding, y: table.height + table.padding + 2, radius: 20 },
  {
    x: table.width / 2 + table.padding,
    y: table.height + table.padding + 2,
    radius: 20,
  },
  {
    x: table.width + table.padding,
    y: table.height + table.padding,
    radius: 20,
  },
];

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
  "#000"
);

function drawTable() {
  ctx.fillStyle = table.borderColor;
  ctx.fillRect(
    0,
    0,
    table.width + table.padding * 2,
    table.padding * 2 + table.height
  );
  ctx.fillStyle = table.tableColor;
  ctx.fillRect(table.padding, table.padding, table.width, table.height);
}

function drawHoles() {
  holes.forEach((hole) => {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
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

function areAllBallsStopped() {
  return [cueBall, ...balls].every(
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

  allBalls.forEach((ball) => {
    if (ball.isPocketed) {
      return;
    }
    if (isBallInHole(ball)) {
      ball.isPocketed = true;
      if (ball === cueBall) {
        resetCueBall();
      } else {
        hitBallCount.textContent = `${Number(hitBallCount.textContent) + 1}`;
      }
    }
  });

  balls = balls.filter((ball) => !ball.isPocketed);

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

  cueBall.dx = Math.cos(radians) * force * 0.25;
  cueBall.dy = Math.sin(radians) * force * 0.25;

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  update();

  if (!areAllBallsStopped()) {
    requestAnimationFrame(gameLoop);
  }
}

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

function resetCueBall() {
  cueBall.x = canvas.width / 2 - 250;
  cueBall.y = canvas.height / 2;
  cueBall.dx = 0;
  cueBall.dy = 0;
  cueBall.isPocketed = false;
  update();
}

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
