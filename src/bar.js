export default class Bar {
  constructor(ctx, rx, y, w, h, color, bgcolor = "black", value, maxvalue) {
    this.ctx = ctx;
    this.x = rx - w;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.bg = bgcolor;
    this.val = value;
    this.max = maxvalue;
    this.disp_val = (this.val / this.max) * this.w;
  }

  #lerp(x, y, a) {
    return x * (1 - a) + y * a;
  }

  draw() {
    if (this.val < 0) this.val = 0;
    if (this.val > this.max) this.val = this.max;

    this.ctx.fillStyle = this.bg;
    this.val_w = (this.val / this.max) * this.w;
    this.disp_val = this.#lerp(this.disp_val, this.val_w, 0.05);
    this.ctx.fillRect(this.x, this.y, this.w, this.h);
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.disp_val, this.h);
  }

  jump() {
    this.sub(3);
  }

  setVal(n) {
    this.val = n;
  }

  sub(amnt = 1) {
    this.val -= amnt;
  }
  add(amnt = 1) {
    this.val += amnt;
  }
}
