import bulletSoundFile from "./assets/laserShoot.wav";

export default class Bullet {
  constructor(ctx, canvas_width, canvas_height, img_r, img_l) {
    this.ctx = ctx;
    this.size = 40;
    this.width = 30;
    this.height = 13;
    this.canvas_height = canvas_height;
    this.canvas_width = canvas_width;
    this.x = 0;
    this.y = 0;
    this.dir = 1;
    this.speed = 300;

    this.img_r = img_r;
    this.img_l = img_l;

    this.sound = new Audio(bulletSoundFile);
    this.sound.volume = 0.2;

    this.box = new Box(this.x, this.y, 5, 14, this.width - 10, this.height - 5);

    this.alive = false;
    this.reset();
  }

  reset() {
    this.sound.currentTime = 0;
    this.sound.play();
    this.alive = false;
    this.dir = Math.random() < 0.5 ? 1 : -1;

    this.img = this.dir === 1 ? this.img_r : this.img_l;
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

    // // Draw hitbox for debugging
    // this.ctx.save();
    // this.ctx.strokeStyle = "yellow";
    // this.ctx.lineWidth = 2;
    // this.ctx.strokeRect(this.x + 5, this.y + 14, this.width, this.height);
    // this.ctx.restore();
  }
  update(deltaTime) {
    this.x += this.speed * this.dir * deltaTime;
    this.box.moveTo(this.x, this.y);

    if (this.x < -500 || this.x > this.canvas_width + 500) {
      this.reset();
    }
  }
}
