import bunciImage from "./assets/bunci.png";
import Player from "./player";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export default async function runGame(clerk_instance) {
  console.log("Game started");
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let running = false;
  let transition = false;

  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = await loadImage(bunciImage);

  let imageSizeFactor = 1;
  let a = 0;
  let y_off = 0;
  let y_off_speed = 0;

  const player = new Player(canvas, ctx);

  function splashScreen() {
    if (transition) {
      y_off_speed += 0.1;
      y_off += y_off_speed;
      if (y_off > canvas.height) {
        running = true;
        transition = false;
      }
    }
    a += 0.05;
    imageSizeFactor = 1 + 0.02 * Math.sin(a);

    const imgWidth = (imageSizeFactor * img.width) / 2;
    const imgHeight = (imageSizeFactor * img.height) / 2;
    const centerX = canvas.width / 2 - imgWidth / 2;
    const centerY = canvas.height / 2 - imgHeight / 2 - 40;
    ctx.drawImage(img, centerX, centerY - y_off, imgWidth, imgHeight);

    ctx.font = "bold 32px Courier, monospace";

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Press space to start!",
      canvas.width / 2,
      canvas.height / 2 + 50 - y_off
    );
  }

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !running) {
      transition = true;
    }
    if (e.key === "a" && running) {
      player.left();
    }
    if (e.key === "d" && running) {
      player.right();
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (!running) {
      transition = true;
    }
    if (e.button === 0 && running && e.clientX < canvas.width / 2) {
      player.left();
    }
    if (e.button === 0 && running && e.clientX >= canvas.width / 2) {
      player.right();
    }
  });

  function gameLoop() {
    ctx.fillStyle = "lightgrey";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!running) {
      splashScreen();
      requestAnimationFrame(gameLoop);
      return;
    }

    player.draw();
    player.update();

    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}
