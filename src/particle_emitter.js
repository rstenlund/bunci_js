import Particle from "./oparticle";

export default class ParticleEmitter {
  constructor(x, y, ctx, emitRate = 50) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.particles = [];
    this.emitRate = emitRate; // particles per frame

    this.size = size + Math.random() * 2;
    this.color = color;
    this.ctx = ctx;
    this.velX = (Math.random() - 0.5) * 2;
    this.velY = Math.random() * 2;
    this.alpha = alpha;
    this.fadeRate = 0.01;

    this.enabled = false;
    this.i = 0;
  }

  enable() {
    this.enabled = true;
  }

  emit() {
    if (!this.enabled) return;
    i++;
    if (this.i >= this.emitRate) {
      this.i = 0;
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          this.size,
          this.color,
          this.alpha,
          this.ctx
        )
      );
    }

    this.particles.forEach((p, index) => {
      p.update();
      if (p.dead()) {
        this.particles.splice(index, 1);
      }
    });
  }
}
