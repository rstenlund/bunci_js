export default class Button {
  constructor(ctx, x, y, width, img, onClick) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = (width / img.width) * img.height;
    this.img = img;
    this.onClick = onClick;
    this.active = true;
  }

  draw() {
    if (!this.active) return;
    this.ctx.drawImage(
      this.img,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }

  #isMouseOver(mouseX, mouseY) {
    return (
      mouseX > this.x - this.width / 2 &&
      mouseX < this.x + this.width / 2 &&
      mouseY > this.y - this.height / 2 &&
      mouseY < this.y + this.height / 2
    );
  }

  handleClick(mouseX, mouseY) {
    if (!this.active) return;
    if (this.#isMouseOver(mouseX, mouseY)) {
      this.onClick();
    }
  }
}
