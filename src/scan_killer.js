export default class ScanKiller {
  constructor(ctx) {
    this.ctx = ctx;
    this.r = 150;
    this.alive = false;
    this.rotation_speed = 10;
    this.angle = 0;
    this.x = 0;
    this.y = 0;
    this.duration = 5000;
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

  update(dT, bullets) {
    if (!this.alive) return;
    const now = Date.now();
    if (now > this.end_time) {
      this.alive = false;
      return;
    }

    this.angle += this.rotation_speed * dT;
    this.ctx.lineWidth = 5;

    let outer_x = this.x + this.r * Math.cos(this.angle);
    let outer_y = this.y + this.r * Math.sin(this.angle);

    // Check collisions with bullets
    for (let bullet of bullets) {
      for (let i = 0; i < this.r; i += 1) {
        let scan_x = this.x + i * Math.cos(this.angle);
        let scan_y = this.y + i * Math.sin(this.angle);
        if (bullet.box.mouseOver(scan_x, scan_y)) {
          bullet.remove = true;
        }
      }
    }

    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
    this.ctx.fillStyle = "green";
    this.ctx.fill();

    this.ctx.strokeStyle = "rgb(102, 255, 51)";

    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(outer_x, outer_y);
    this.ctx.stroke();
  }

  dead() {
    return !this.alive;
  }
}
