import bunciImage from "./assets/bunci.png";
import playerImage from "./assets/player.png";
import trophyImage from "./assets/trophy.png";
import skott_r_Image from "./assets/skott_r.png";
import skott_l_Image from "./assets/skott_l.png";

import Player from "./player";
import Bullet from "./bullet";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zgabmcriwnxjjvcckkjm.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  const { data, error } = await supabase.from("leaderboard").select("");
  if (error) {
    console.error("Error fetching leaderboard data:", error);
    return;
  }
  let max_score = 0;

  console.log(clerk_instance.user.username);
  for (let entry of data) {
    if (entry.user == clerk_instance.user.username) {
      console.log("User found in leaderboard:", entry.user);
      console.log("Score:", entry.score);
      max_score = entry.score;
    }
  }
  if (max_score === 0) {
    const { data, error } = await supabase
      .from("leaderboard")
      .insert([{ user: clerk_instance.user.username, score: 0 }])
      .select();
    if (error) {
      console.error("Error fetching leaderboard data:", error);
      return;
    }
  }

  console.log("Leaderboard data:", data);

  let running = false;
  let transition = false;
  let dead = false;

  const img = await loadImage(bunciImage);

  const player_sprite = await loadImage(playerImage);

  const skott_r_sprite = await loadImage(skott_r_Image);
  const skott_l_sprite = await loadImage(skott_l_Image);

  const trophy_sprite = await loadImage(trophyImage);
  const trophySize = 60;

  let bullets = [
    new Bullet(
      ctx,
      canvas.width,
      canvas.height,
      skott_r_sprite,
      skott_l_sprite
    ),
  ];

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
        for (let bullet of bullets) {
          bullet.reset();
        }
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

    ctx.drawImage(
      trophy_sprite,
      canvas.width - trophySize - 20,
      20 - y_off,
      trophySize,
      trophySize
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
        score = 0;

        for (let bullet of bullets) {
          bullet.reset();
        }
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

    ctx.drawImage(
      trophy_sprite,
      canvas.width - trophySize - 20,
      20 - y_off,
      trophySize,
      trophySize
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
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    console.log("Canvas coordinates:", canvasX, canvasY);

    if (!running && !transition) {
      if (
        canvasX > canvas.width - trophySize - 20 &&
        canvasX < canvas.width - 20 &&
        canvasY > 20 &&
        canvasY < 20 + trophySize
      ) {
        // clicked on trophy
        console.log("trophy clicked");
        return;
      }
    }
    if (!running) {
      transition = true;
    }
    if (e.button === 0 && running && canvasX < canvas.width / 2) {
      player.left();
    }
    if (e.button === 0 && running && canvasX >= canvas.width / 2) {
      player.right();
    }
  });

  let del = 0;

  let l = Date.now();
  let score = 0;

  async function gameLoop() {
    if (del < 1000) {
      del++;
    }

    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) / 1.2
    );
    gradient.addColorStop(0, "#cccccc"); // light grey center
    gradient.addColorStop(1, "#444444"); // dark grey edges
    ctx.fillStyle = gradient;
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

    if (Date.now() - l >= 1000) {
      score++;
      console.log(score);
      l = Date.now();
    }

    //display score
    ctx.font = "bold 24px Courier, monospace";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, canvas.width / 2, 20);
    ctx.fillText("Best: " + max_score, canvas.width / 2, 50);

    if (player.outOfBounds()) {
      dead = true;
      imageSizeFactor = 1;
      a = 0;
      y_off = 0;
      y_off_speed = 0;
      transition = false;
      running = false;
      if (score > max_score) {
        max_score = score;
        const { data, error } = await supabase
          .from("leaderboard")
          .update({ score: max_score })
          .eq("user", clerk_instance.user.username)
          .select();

        if (error) {
          console.error("Error updating leaderboard:", error);
        } else {
          console.log(data);
        }
      }
      score = 0;
      deathScreen();
      requestAnimationFrame(gameLoop);
      return;
    }

    if (del > 300) {
      for (let bullet of bullets) {
        bullet.draw();
        bullet.update(player.deltaTime);
      }
    }

    player.draw();
    player.update();

    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}
