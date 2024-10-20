import type { BilliardWorld } from "..";
import Table from "./table";

class Ball {
  x: number;
  y: number;
  radius: number = 10;
  dx: number = 0;
  dy: number = 0;
  color: string;
  mass: number = 1;
  isPocketed: boolean = false;
  canvas: HTMLCanvasElement;
  table: Table;
  constructor(
    x: number,
    y: number,
    world: BilliardWorld,
    color: string = "#FFFFFF"
  ) {
    this.x = x;
    this.y = y;
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

    this.dx *= 0.98;
    this.dy *= 0.98;

    if (Math.abs(this.dx) < 0.01) this.dx = 0;
    if (Math.abs(this.dy) < 0.01) this.dy = 0;

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
}

export default Ball;
