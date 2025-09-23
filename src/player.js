import ParticleEmitter from "./particle_emitter";

export default class Player {
  constructor(canvas, ctx) {
    //rendering
    this.canvas = canvas;
    this.ctx = ctx;

    //position and size
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = 60;

    //movement
    this.vely = 0;
    this.velx = 0;
    this.g = 0.0065; // gravity
    this.jumpStrength = -0.55;
    this.dashStrength = 0.35;
    this.timenow = Date.now();
    this.lastFrame = Date.now();
    this.deltaTime = 0;
    this.rot = 0;
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  draw() {
    //fade in black square
    if (this.fade === undefined) this.fade = 0;
    if (this.fade < 1) this.fade += 0.05;
    this.ctx.globalAlpha = this.fade;

    this.rot = this.lerp(this.rot, (Math.PI / 180) * this.velx * 140, 0.07);

    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rot);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    this.ctx.restore();
  }

  update() {
    if (this.fade < 1) return; // don't update until fully faded in
    this.timenow = Date.now();
    this.deltaTime = this.timenow - this.lastFrame;
    console.log(this.deltaTime);
    this.vely += this.g;
    this.y += this.vely * this.deltaTime;
    this.x += this.velx * this.deltaTime;
    this.velx *= 0.998; // friction

    this.lastFrame = this.timenow;
  }

  left() {
    this.velx = -this.dashStrength;
    this.vely = this.jumpStrength;
  }
  right() {
    this.velx = this.dashStrength;
    this.vely = this.jumpStrength;
  }
}
