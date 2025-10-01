export default class ScanKiller {
  constructor(ctx) {
    this.ctx = ctx;
    this.r = 150;
    this.alive = false;
    this.rotation_speed = 2;
    this.angle = 0;
    this.x = 0;
    this.y = 0;
    this.duration = 3000;
    this.start_time = 0;
    this.end_time = 0;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  start() {
    this.alive = true;
    this.start_time = Date.now();
    this.end_time = this.start_time + this.duration;
    this.angle = 0;
  }

  update(dT) {
    if (!this.alive) return;
    const now = Date.now();
    if (now > this.end_time) {
      this.alive = false;
      return;
    }

    this.angle += this.rotation_speed * dT;
    this.ctx.strokeStyle = "green";
    this.ctx.lineWidth = 5;
    let outer_x = this.x + this.r * Math.cos(this.angle);
    let outer_y = this.y + this.r * Math.sin(this.angle);
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(outer_x, outer_y);
    this.ctx.stroke();
  }

  dead() {
    return !this.alive;
  }
}
