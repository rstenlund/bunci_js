import Box from "./box";

export default class Inventory {
  constructor(pickup, canvas, ctx, sprite) {
    this.pickup = pickup;
    this.canvas = canvas;
    this.ctx = ctx;
    this.size = 60;
    this.margin = 20;
    this.sprite = sprite;
    this.x = this.margin;
    this.y = this.canvas.height - this.size - this.margin;
    this.hitbox = new Box(this.x, this.y, 0, 0, this.size, this.size);
    this.count = 0;
  }

  add() {
    this.count += 1;
  }

  draw() {
    this.ctx.drawImage(this.sprite, this.x, this.y, this.size, this.size);
  }
}
