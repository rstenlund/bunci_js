export default class NumberDisplay {
  constructor(ctx, x, y, size = 30, color = "white", img) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.img = img;
    this.value = 0;
  }

  setValue(value) {
    this.value = value;
    this.draw();
  }

  add(amount = 1) {
    this.value += amount;
    this.draw();
  }

  subtract(amount = 1) {
    this.value -= amount;
    this.draw();
  }

  draw() {
    this.ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.font = `bold ${this.size / 2}px Courier, monospace`;

    this.ctx.fillText(
      this.value,
      this.x + this.size + 12,
      this.y + this.size / 2
    );
  }
}
