import { IBilliardWorld } from "../game";
import Point from "./point";
import Table from "./table";

export const EPSILON = 0.01

const SPEED_DRAIN = 0.98;

class Ball {
  point: Point;
  radius: number = 10;
  dx: number = 0;
  dy: number = 0;
  color: string;
  isPocketed: boolean = false;
  canvas: HTMLCanvasElement;
  table: Table;
  constructor(
    point: Point,
    world: IBilliardWorld,
    color: string = "#FFFFFF"
  ) {
    this.point = point;
    this.color = color;
    this.canvas = world.canvas;
    this.table = world.table;
  }

  draw() {
    if (this.isPocketed) return;

    const ctx = this.canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  update() {
    if (this.isPocketed) return;

    this.x += this.dx;
    this.y += this.dy;

    this.dx *= SPEED_DRAIN;
    this.dy *= SPEED_DRAIN;

    if (Math.abs(this.dx) < EPSILON) this.dx = 0;
    if (Math.abs(this.dy) < EPSILON) this.dy = 0;

    if (
      this.x + this.radius > this.table.width + this.table.padding ||
      this.x - this.radius < this.table.padding
    ) {
      this.dx = -this.dx;

      if (this.x + this.radius > this.table.width + this.table.padding)
        this.x = this.table.width + this.table.padding - this.radius;
      if (this.x - this.radius < this.table.padding)
        this.x = this.table.padding + this.radius;
    }
    if (
      this.y + this.radius > this.table.height + this.table.padding ||
      this.y - this.radius < this.table.padding
    ) {
      this.dy = -this.dy;

      if (this.y + this.radius > this.table.height + this.table.padding)
        this.y = this.table.height + this.table.padding - this.radius;
      if (this.y - this.radius < this.table.padding)
        this.y = this.table.padding + this.radius;
    }

    this.draw();
  }

  get x() {
    return this.point.x;
  }

  set x(newX: number) {
    this.point.x = newX
  }

  get y() {
    return this.point.y;
  }

  set y(newY: number) {
    this.point.y = newY
  }
}

export default Ball;
