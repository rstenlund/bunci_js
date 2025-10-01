import Box from "./box";

export default class Pickup {
  constructor(ctx, canvas_width, canvas_height, img, speed = 300) {
    this.ctx = ctx;
    this.size = 40;
    this.width = this.size;
    this.height = this.size;
    this.canvas_height = canvas_height;
    this.canvas_width = canvas_width;
    this.x = 0;
    this.y = 0;
    this.dir = 1;
    this.speed = speed;

    this.box = new Box(this.x, this.y, 0, 0, this.width, this.height);

    this.img = img;

    this.alive = false;
    this.reset();
  }

  reset() {
    this.alive = false;
    this.dir = Math.random() < 0.5 ? 1 : -1;
    if (this.dir === 1) {
      this.x = -1 * (Math.random() * 300 + 50);
    } else {
      this.x = this.canvas_width + Math.random() * 300 + 50;
    }
    this.y = Math.random() * (this.canvas_height - this.size);
  }

  draw() {
    this.ctx.fillStyle = "red";

    this.ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
    this.box.debug(this.ctx);
  }
  update(deltaTime) {
    this.x += this.speed * this.dir * deltaTime;

    this.box.moveTo(this.x, this.y);

    if (this.x < -500 || this.x > this.canvas_width + 500) {
      this.reset();
    }
  }
}
