import Particle from "./oparticle";

export default class ParticleEmitter {
  constructor(
    x,
    y,
    ctx,
    emitRate = 50,
    size = 5,
    color = "orange",
    alpha = 1,
    downward = true
  ) {
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

    this.downward = downward;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  burst(time) {
    this.enable();
    setTimeout(() => {
      this.disable();
    }, time);
  }

  emit() {
    if (!this.enabled) return;
    this.i++;
    if (this.i >= this.emitRate) {
      this.i = 0;
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          this.size,
          this.color,
          this.alpha,
          this.ctx,
          this.downward
        )
      );
    }
  }

  updateParticles() {
    this.particles.forEach((p, index) => {
      p.update();
      p.draw();
      if (p.dead()) {
        this.particles.splice(index, 1);
      }
    });
  }
}
