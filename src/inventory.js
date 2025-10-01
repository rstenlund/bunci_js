import Box from "./box";

export default class Inventory {
  constructor(pickup, canvas, ctx) {
    this.pickup = pickup;
    this.canvas = canvas;
    this.ctx = ctx;
    this.size = 50;
    this.margin = 20;
    this.x = this.margin;
    this.y = this.canvas.height - this.size - this.margin;
    this.hitbox = new Box(this.x, this.y, 0, 0, this.size, this.size);
  }
}
