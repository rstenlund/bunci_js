import ParticleEmitter from "./particle_emitter";

export default class Player {
  constructor(canvas, ctx, sprite) {
    //rendering
    this.canvas = canvas;
    this.ctx = ctx;

    //position and size
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = 80;

    this.img = sprite;

    //movement
    this.vely = 0;
    this.velx = 0;
    this.g = 1400.5; // gravity
    this.jumpStrength = -600;
    this.dashStrength = 350;

    this.timenow = Date.now();
    this.lastFrame = Date.now() - 6;
    this.deltaTime = (this.timenow - this.lastFrame) / 1000;
    this.rot = 0;

    this.emitter = new ParticleEmitter(20, 20, this.ctx, 1, 3);
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  draw(hitbox = false) {
    //fade in black square
    if (this.fade === undefined) this.fade = 0;
    if (this.fade < 1) this.fade += 0.05;
    this.ctx.globalAlpha = this.fade;

    this.rot = this.lerp(this.rot, (Math.PI / 180) * this.velx * 0.15, 0.07);

    this.emitter.updateParticles();
    this.emitter.emit();

    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rot);
    //this.ctx.fillStyle = "black";
    //this.ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

    this.ctx.drawImage(
      this.img,
      this.size / -2,
      this.size / -2,
      this.size,
      this.size
    );
    this.ctx.restore();

    if (hitbox) {
      this.ctx.strokeStyle = "red";
      let hitbox_size = this.size * 0.6;
      this.ctx.strokeRect(
        this.x - hitbox_size / 2,
        this.y - hitbox_size / 2,
        hitbox_size,
        hitbox_size
      );
    }
  }
  update() {
    if (this.fade < 1) return; // don't update until fully faded in
    this.timenow = Date.now();
    this.deltaTime = (this.timenow - this.lastFrame) / 1000; // deltaTime in seconds
    console.log(this.deltaTime);

    this.vely += this.g * this.deltaTime;
    this.y += this.vely * this.deltaTime;
    this.x += this.velx * this.deltaTime;
    this.velx *= Math.pow(0.998, this.deltaTime * 60); // frame-rate independent friction

    this.lastFrame = this.timenow;

    let x = Math.cos(this.rot - Math.PI / 2) * (this.size / 2);
    let y = Math.sin(this.rot - Math.PI / 2) * (this.size / 2);
    this.emitter.moveTo(this.x - x, this.y - y);
  }

  left() {
    this.velx = -this.dashStrength;
    this.vely = this.jumpStrength;
    this.emitter.burst(150);
  }
  right() {
    this.velx = this.dashStrength;
    this.vely = this.jumpStrength;
    this.emitter.burst(150);
  }

  outOfBounds() {
    return (
      this.x < -this.size * 2 ||
      this.x > this.canvas.width + this.size * 2 ||
      this.y < -this.size * 2 ||
      this.y > this.canvas.height + this.size * 2
    );
  }

  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.vely = 0;
    this.velx = 0;
    this.rot = 0;
    this.fade = 0;
    this.timenow = Date.now();
    this.lastFrame = Date.now() - 0.1;
    this.deltaTime = (this.timenow - this.lastFrame) / 1000;
  }

  collidesWithBullet(bullet) {
    // this is the bullets hitbox: this.ctx.fillRect(this.x + 5, this.y + 15, this.width - 12, this.height);
    return (
      this.x + this.size * 0.3 > bullet.x + 5 &&
      this.x - this.size * 0.3 < bullet.x + bullet.width - 5 &&
      this.y + this.size * 0.3 > bullet.y + 15 &&
      this.y - this.size * 0.3 < bullet.y + bullet.height - 15
    );
  }

  collidesWithPickup(coin) {
    // this is the coins hitbox: this.ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
    return (
      this.x + this.size * 0.3 > coin.x &&
      this.x - this.size * 0.3 < coin.x + coin.size &&
      this.y + this.size * 0.3 > coin.y &&
      this.y - this.size * 0.3 < coin.y + coin.size
    );
  }
}
