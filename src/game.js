import bunciImage from "./assets/bunci.png";
import playerImage from "./assets/player.png";
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
  let dead = false;

  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = await loadImage(bunciImage);

  const player_sprite = await loadImage(playerImage);

  let imageSizeFactor = 1;
  let a = 0;
  let y_off = 0;
  let y_off_speed = 0;

  const player = new Player(canvas, ctx, player_sprite);

  function splashScreen() {
    if (dead) {
      return;
    }
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

  function deathScreen() {
    console.log("Player is dead");

    player.reset();

    if (transition) {
      y_off_speed += 0.1;
      y_off += y_off_speed;
      if (y_off > canvas.height) {
        running = true;
        transition = false;
        dead = false;
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
      "You died. Press space to restart!",
      canvas.width / 2,
      canvas.height / 2 + 50 - y_off
    );
  }

  document.addEventListener("keypress", (e) => {
    if (e.code === "Space" && !running) {
      transition = true;

      console.log("go");
    }
    if (e.key === "a" && running) {
      player.left();
    }
    if (e.key === "d" && running) {
      player.right();
    }
  });

  canvas.addEventListener("mousedown", (e) => {
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

    if (dead) {
      deathScreen();
      requestAnimationFrame(gameLoop);
      return;
    }
    if (!running) {
      splashScreen();
      requestAnimationFrame(gameLoop);
      return;
    }

    if (player.outOfBounds()) {
      dead = true;
      imageSizeFactor = 1;
      a = 0;
      y_off = 0;
      y_off_speed = 0;
      transition = false;
      running = false;
      deathScreen();
      requestAnimationFrame(gameLoop);
      return;
    }

    player.draw();
    player.update();

    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}
