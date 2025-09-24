export default class Bullet {
  constructor(ctx, canvas_width, canvas_height, img_r, img_l) {
    this.ctx = ctx;
    this.width = 40;
    this.height = 10;
    this.canvas_height = canvas_height;
    this.canvas_width = canvas_width;
    this.x = 0;
    this.y = 0;
    this.dir = 1;
    this.speed = 500;

    this.img_r = img_r;
    this.img_l = img_l;

    this.reset();
  }

  reset() {
    this.dir = Math.random() < 0.5 ? 1 : -1;
    if (this.dir === 1) {
      this.x = -1 * (Math.random() * 300 + 50);
    } else {
      this.x = this.canvas_width + Math.random() * 300 + 50;
    }
    this.y = Math.random() * (this.canvas_height - this.height);
  }

  draw() {
    this.ctx.fillStyle = "red";

    this.img = this.dir === 1 ? this.img_r : this.img_l;
    this.ctx.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      (this.width / this.img.width) * this.img.height
    );
  }
  update(deltaTime) {
    this.x += this.speed * this.dir * deltaTime;

    if (this.x < -500 || this.x > this.canvas_width + 500) {
      this.reset();
    }
  }
}
