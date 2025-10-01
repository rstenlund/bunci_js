export default class Box {
  constructor(x_origin, y_origin, x_off, y_off, width, height) {
    this.xorg = x_origin;
    this.yorg = y_origin;
    this.x_off = x_off;
    this.y_off = y_off;
    this.x = this.xorg + this.x_off;
    this.y = this.yorg + this.y_off;
    this.w = width;
    this.h = height;
  }

  moveTo(x, y) {
    this.xorg = x;
    this.yorg = y;
    this.x = this.xorg + this.x_off;
    this.y = this.yorg + this.y_off;
  }

  debug(ctx) {
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }

  intersectsWith(other_box) {
    return (
      this.x + this.w > other_box.x &&
      this.x < other_box.x + other_box.w &&
      this.y + this.h > other_box.y &&
      this.y < other_box.y + other_box.h
    );
  }

  mouseOver(mouse_x, mouse_y) {
    return (
      mouse_x > this.x &&
      mouse_x < this.x + this.w &&
      mouse_y > this.y &&
      mouse_y < this.y + this.h
    );
  }
}
