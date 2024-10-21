import Ball, { EPSILON } from "../entities/ball";
import Hole from "../entities/hole";
import Point from "../entities/point";
import Table from "../entities/table";
import { isColliding, resolveCollision } from "../physics/collision";
import { displayInputValues, increaseHitballCount } from "./displayInfo";

export type IStartGame = (
  canvas: HTMLCanvasElement,
  angleInput: HTMLInputElement,
  forceInput: HTMLInputElement,
  strikeButton: HTMLButtonElement
) => void;

export type ICreateInitialBalls = (
  startX: number,
  startY: number,
  world: IBilliardWorld
) => Ball[];

export type IBilliardWorld = {
  canvas: HTMLCanvasElement;
  table: Table;
};

const INITIAL_BALL_TRIANGLE_OFFSET = 150;
const INITIAL_CUE_BALL_OFFSET = 250;

const CUE_OFFSET = 15;
const CUE_LENGTH = 100;

const FORCE_MULTIPLIER = 0.25;

const createInitialBalls: ICreateInitialBalls = (
  startX: number,
  startY: number,
  world: IBilliardWorld
) => {
  const balls: Ball[] = [];
  const spacing = 2 * 10 + 5;

  let offsetY = 0;

  balls.push(new Ball(new Point(startX, startY), world));

  offsetY = spacing / 2;
  balls.push(new Ball(new Point(startX + spacing, startY + offsetY), world));
  balls.push(new Ball(new Point(startX + spacing, startY - offsetY), world));

  let rowNum = 3;
  offsetY = spacing;
  for (let i = 0; i < rowNum; i++) {
    balls.push(
      new Ball(
        new Point(startX + 2 * spacing, startY - offsetY + i * spacing),
        world
      )
    );
  }

  rowNum = 4;
  offsetY = spacing * 1.5;
  for (let i = 0; i < rowNum; i++) {
    balls.push(
      new Ball(
        new Point(startX + 3 * spacing, startY - offsetY + i * spacing),
        world
      )
    );
  }

  rowNum = 5;
  offsetY = spacing * 2;
  for (let i = 0; i < rowNum; i++) {
    balls.push(
      new Ball(
        new Point(startX + 4 * spacing, startY - offsetY + i * spacing),
        world
      )
    );
  }

  return balls;
};

const startGame: IStartGame = (
  canvas,
  angleInput,
  forceInput,
  strikeButton
) => {
  const table = new Table(800, 400, 10, "#006400", "#654321");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const world: IBilliardWorld = { canvas, table };

  let balls: Ball[] = createInitialBalls(
    table.width / 2 + INITIAL_BALL_TRIANGLE_OFFSET,
    table.height / 2 + table.padding,
    world
  );

  const initialBallPosition = {
    x: table.width / 2 - INITIAL_CUE_BALL_OFFSET,
    y: table.height / 2 + table.padding,
  };
  const cueBall = new Ball(
    new Point(
      initialBallPosition.x,
      initialBallPosition.y,
    ),
    world,
    "#000"
  );

  const holes = [
    new Hole(new Point(table.padding, table.padding)),
    new Hole(new Point(table.width / 2 + table.padding, table.padding)),
    new Hole(new Point(table.width + table.padding, table.padding)),
    new Hole(new Point(table.padding, table.height + table.padding)),
    new Hole(
      new Point(table.width / 2 + table.padding, table.height + table.padding)
    ),
    new Hole(
      new Point(table.width + table.padding, table.height + table.padding)
    ),
  ];

  const areAllBallsStopped = () => {
    return [cueBall, ...balls].every(
      (ball) => Math.abs(ball.dx) < EPSILON && Math.abs(ball.dy) < EPSILON
    );
  };

  const updateGameState = () => {
    function drawBilliardTable() {
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

    function drawCueStick() {
      const angle = Number(angleInput.value);
      const radians = (angle * Math.PI) / 180;

      const cueStartX = cueBall.x - Math.cos(radians) * CUE_OFFSET;
      const cueStartY = cueBall.y - Math.sin(radians) * CUE_OFFSET;

      const cueEndX = cueStartX - Math.cos(radians) * CUE_LENGTH;
      const cueEndY = cueStartY - Math.sin(radians) * CUE_LENGTH;

      ctx.beginPath();
      ctx.moveTo(cueStartX, cueStartY);
      ctx.lineTo(cueEndX, cueEndY);
      ctx.strokeStyle = "#8B4513";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();
    }

    function resetCueBall() {
      cueBall.x = initialBallPosition.x;
      cueBall.y = initialBallPosition.y;
      cueBall.dx = 0;
      cueBall.dy = 0;
      cueBall.isPocketed = false;
      updateGameState();
    }

    displayInputValues();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBilliardTable();
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
          increaseHitballCount();
        }
      }
    });

    balls = balls.filter((ball) => !ball.isPocketed);

    if (areAllBallsStopped() && balls.length) {
      drawCueStick();
      angleInput.disabled = false;
      forceInput.disabled = false;
      strikeButton.disabled = false;
    } else {
      angleInput.disabled = true;
      forceInput.disabled = true;
      strikeButton.disabled = true;
    }
  };

  const gameLoop = () => {
    updateGameState();

    if (!areAllBallsStopped()) {
      requestAnimationFrame(gameLoop);
    }
  };

  const strikeBall = () => {
    if (!areAllBallsStopped()) return;

    const angle = Number(angleInput.value);
    const force = Number(forceInput.value);
    const radians = (angle * Math.PI) / 180;

    cueBall.dx = Math.cos(radians) * force * FORCE_MULTIPLIER;
    cueBall.dy = Math.sin(radians) * force * FORCE_MULTIPLIER;

    requestAnimationFrame(gameLoop);
  };

  strikeButton.addEventListener("click", strikeBall);

  angleInput.addEventListener("input", () => {
    if (areAllBallsStopped()) updateGameState();
  });

  forceInput.addEventListener("input", () => {
    displayInputValues();
  });

  updateGameState();
};

export default startGame;
