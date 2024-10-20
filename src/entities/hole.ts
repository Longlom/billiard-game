import type Point from "./point";

const HOLE_RADIUS = 20;

class Hole {
  point: Point;
  radius = HOLE_RADIUS;
  constructor(point: Point) {
    this.point = point;
  }

  get x() {
    return this.point.x;
  }
  get y() {
    return this.point.y;
  }
}

export default Hole;
