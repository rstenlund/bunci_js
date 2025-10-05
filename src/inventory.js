import Box from "./box";

export default class Inventory {
  constructor(pickup, canvas, ctx, sprite, slot_number = 0) {
    this.pickup = pickup;
    this.canvas = canvas;
    this.ctx = ctx;
    this.size = 60;
    this.margin = 20;
    this.sprite = sprite;
    this.x = this.margin + this.size * slot_number + this.margin * slot_number;
    this.y = this.canvas.height - this.size - this.margin;
    this.hitbox = new Box(this.x, this.y, 0, 0, this.size, this.size);
    this.count = 0;
    this.itemSize = this.size / 2;
  }

  reset() {
    this.count = 0;
  }

  use() {
    if (this.count > 0) {
      this.count -= 1;
      return true;
    }
    return false;
  }

  add() {
    this.count += 1;
  }

  draw() {
    this.ctx.drawImage(this.sprite, this.x, this.y, this.size, this.size);
    if (this.count > 0) {
      this.ctx.drawImage(
        this.pickup.img,
        this.x + this.size / 2 - this.itemSize / 2 + 2,
        this.y + this.size / 2 - this.itemSize / 2 + 2,
        this.itemSize,
        this.itemSize
      );
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.font = "18px Courier, monospace";
      this.ctx.fillText(
        this.count,
        this.x + this.size - 12,
        this.y + this.size - 15
      );
    }
  }
}
