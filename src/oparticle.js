export default class Particle {
  constructor(x, y, size, color, alpha, ctx, downward = true) {
    this.x = x;
    this.y = y;
    this.size = size + Math.random() * 2;
    this.color = color;
    this.ctx = ctx;
    this.downward = downward;
    this.velX = (Math.random() - 0.5) * 2;
    this.velY = this.downward ? Math.random() * 2 : (Math.random() - 0.5) * 2;

    this.alpha = alpha;
    this.fadeRate = 0.011;
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
    this.alpha -= this.fadeRate;
    if (this.alpha < 0) this.alpha = 0;
  }

  dead() {
    return this.alpha == 0;
  }

  draw() {
    this.ctx.save();
    this.ctx.globalAlpha = this.alpha;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.restore();
  }
}
