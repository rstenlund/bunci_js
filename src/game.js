import bunciImage from "./assets/bunci.png";
import playerImage from "./assets/player.png";
import trophyImage from "./assets/trophy.png";
import skott_r_Image from "./assets/skott_r.png";
import skott_l_Image from "./assets/skott_l.png";
import kryssImage from "./assets/kryss.png";
import leaderboard_frameImage from "./assets/leaderboard_frame.png";
import coinImage from "./assets/coin.png";
import bombImage from "./assets/bomb.png";

import Player from "./player";
import Bullet from "./bullet";
import Pickup from "./pickup";

import ParticleEmitter from "./particle_emitter";

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

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  }

  function resizeCanvas() {
    if (isMobile()) {
      // On phone: 85% of viewport width
      canvas.style.width = "85vw";
      canvas.style.height = "auto";
    } else {
      // On PC: 70% of viewport height
      canvas.style.height = "70vh";
      canvas.style.width = "auto";
    }
  }

  canvas.width = 1000;
  canvas.height = 700;
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const ctx = canvas.getContext("2d");

  const { data, error } = await supabase.from("leaderboard").select("");
  if (error) {
    console.error("Error fetching leaderboard data:", error);
    return;
  }
  let leaderboard_data = data;
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
  let leaderboard_menu = false;

  const img = await loadImage(bunciImage);

  const player_sprite = await loadImage(playerImage);

  const skott_r_sprite = await loadImage(skott_r_Image);
  const skott_l_sprite = await loadImage(skott_l_Image);

  const kryss_sprite = await loadImage(kryssImage);
  const coin_sprite = await loadImage(coinImage);
  const bomb_sprite = await loadImage(bombImage);

  const explosion = new ParticleEmitter(0, 0, ctx, 1, 5, "red", 1.5, false);

  const leaderboard_frame_sprite = await loadImage(leaderboard_frameImage);

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

  let coin = new Pickup(ctx, canvas.width, canvas.height, coin_sprite, 200);
  let bomb = new Pickup(ctx, canvas.width, canvas.height, bomb_sprite, 500);

  let imageSizeFactor = 1;
  let a = 0;
  let y_off = 0;
  let y_off_speed = 0;

  const player = new Player(canvas, ctx, player_sprite);

  const zoomSpeed = 6;
  const transitionSpeed = 15;

  function splashScreen() {
    if (dead) {
      return;
    }
    if (transition) {
      y_off_speed += transitionSpeed;
      y_off += y_off_speed * dT;
      if (y_off > canvas.height) {
        running = true;
        transition = false;
        for (let bullet of bullets) {
          bullet.reset();
        }
        player.reset();
      }
    }
    a += zoomSpeed * dT;
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
    // console.log("Player is dead");

    if (transition) {
      y_off_speed += transitionSpeed;
      y_off += y_off_speed * dT;
      if (y_off > canvas.height) {
        running = true;
        transition = false;
        dead = false;
        score = 0;
        bullets = [
          new Bullet(
            ctx,
            canvas.width,
            canvas.height,
            skott_r_sprite,
            skott_l_sprite
          ),
        ];

        coin.reset();
        bomb.reset();
        player.reset();

        for (let bullet of bullets) {
          bullet.reset();
        }
      }
    }
    a += zoomSpeed * dT;
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

  function leaderboardScreen() {
    // sort the leaderboard data by score
    leaderboard_data.sort((a, b) => b.score - a.score);
    let leaderboard_frame_width = 400;
    let leaderboard_frame_height =
      (leaderboard_frame_width / leaderboard_frame_sprite.width) *
      leaderboard_frame_sprite.height;
    ctx.drawImage(
      leaderboard_frame_sprite,
      canvas.width / 2 - leaderboard_frame_width / 2,
      30,
      leaderboard_frame_width,
      leaderboard_frame_height
    );
    //console.log(leaderboard_data);
    ctx.font = "bold 24px Courier, monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Leaderboard",
      canvas.width / 2,
      30 + leaderboard_frame_height / 2
    );
    ctx.font = "20px Courier, monospace";
    for (let i = 0; i < Math.min(10, leaderboard_data.length); i++) {
      let entry = leaderboard_data[i];
      if (entry.score > 0) {
        ctx.drawImage(
          leaderboard_frame_sprite,
          canvas.width / 2 - leaderboard_frame_width / 2,
          120 + i * 55 - leaderboard_frame_height / 2,
          leaderboard_frame_width,
          leaderboard_frame_height
        );

        ctx.fillStyle = "white";
        if (entry.user == "ruben") {
          ctx.fillStyle = "#FFD700";
        }
        //c
        ctx.fillText(
          `${i + 1}. ${entry.user}: ${entry.score}`,
          canvas.width / 2,
          120 + i * 55
        );
      }
    }

    ctx.drawImage(
      kryss_sprite,
      canvas.width - trophySize - 20,
      20 - y_off,
      trophySize,
      trophySize
    );
  }

  document.addEventListener("keypress", (e) => {
    if (e.code === "Space" && !running) {
      transition = true;

      //console.log("go");
    }
    if (e.key === "a" && running) {
      player.left();
    }
    if (e.key === "d" && running) {
      player.right();
    }
  });

  canvas.addEventListener("mousedown", async (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    console.log("Canvas coordinates:", canvasX, canvasY);

    if (!running && !transition) {
      //console.log("go");
      if (
        canvasX > canvas.width - trophySize - 20 &&
        canvasX < canvas.width - 20 &&
        canvasY > 20 &&
        canvasY < 20 + trophySize
      ) {
        // clicked on trophy
        console.log("button clicked");
        leaderboard_menu = !leaderboard_menu;
        if (leaderboard_menu) {
          const { data, error } = await supabase.from("leaderboard").select("");
          if (error) {
            console.error("Error fetching leaderboard data:", error);
            return;
          }
          leaderboard_data = data;
        }

        return;
      }
    }
    if (leaderboard_menu) {
      return;
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

  let dT = 0.005;
  let score = 0;

  let lastTime = Date.now();
  let l = Date.now();
  async function gameLoop() {
    dT = (Date.now() - lastTime) / 1000;
    lastTime = Date.now();

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

    if (leaderboard_menu) {
      leaderboardScreen();
      requestAnimationFrame(gameLoop);
      return;
    }

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
      //console.log(score);
      l = Date.now();
      if (score % 8 == 0) {
        bullets.push(
          new Bullet(
            ctx,
            canvas.width,
            canvas.height,
            skott_r_sprite,
            skott_l_sprite
          )
        );
      }
      if (score % 12 == 0 && !coin.alive) {
        coin.alive = true;
      }

      if (score % 45 == 0 && !bomb.alive) {
        bomb.alive = true;
      }
    }

    //display score
    ctx.font = "bold 24px Courier, monospace";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, canvas.width / 2, 20);
    ctx.fillText("Best: " + max_score, canvas.width / 2, 50);

    if (coin.alive) {
      coin.draw();
      coin.update(dT);
    }

    if (bomb.alive) {
      bomb.draw();
      bomb.update(dT);
    }

    if (coin.alive && player.collidesWithPickup(coin)) {
      //console.log("Player collected coin");
      coin.reset();
      score += 5;
    }

    if (bomb.alive && player.collidesWithPickup(bomb)) {
      //console.log("Player hit bomb");
      explosion.moveTo(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2);
      explosion.burst(300);
      bomb.reset();

      bullets = bullets.filter(() => Math.random() < 0.5);
    }

    explosion.emit();
    explosion.updateParticles();

    if (del > 300) {
      for (let bullet of bullets) {
        bullet.draw();
        bullet.update(dT);
        if (player.collidesWithBullet(bullet) || player.outOfBounds()) {
          //console.log("Player hit by bullet");
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
              //console.log(data);
            }
            clerk_instance.user.update({
              unsafeMetadata: { highscore: max_score },
            });
          }
          score = 0;
          deathScreen();
          requestAnimationFrame(gameLoop);
          return;
        }
      }
    }

    player.update(dT);
    player.draw();

    requestAnimationFrame(gameLoop);
  }
  gameLoop();
}
