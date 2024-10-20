import Ball from "../entities/ball";

function rotate(velocity: { x: number; y: number }, angle: number) {
  return {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };
}

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
  const yDistacne = ball2.y - ball1.y;

  if (xVelocityDiff * xDistance + yVelocityDiff * yDistacne >= 0) {
    const angle = -Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);

    const rotatedVelocityBall1 = rotate({ x: ball1.dx, y: ball1.dy }, angle);
    const rotatedVelocityBall2 = rotate({ x: ball2.dx, y: ball2.dy }, angle);

    const v1 = { x: rotatedVelocityBall2.x, y: rotatedVelocityBall1.y };
    const v2 = { x: rotatedVelocityBall1.x, y: rotatedVelocityBall2.y };

    const originCoordBall1 = rotate(v1, -angle);
    const originCoordBall2 = rotate(v2, -angle);

    ball1.dx = originCoordBall1.x;
    ball1.dy = originCoordBall1.y;
    ball2.dx = originCoordBall2.x;
    ball2.dy = originCoordBall2.y;
  }
}

export { resolveCollision, isColliding };
