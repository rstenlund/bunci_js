import bunciImage from "./assets/bunci.png";
import playerImage from "./assets/player.png";
import trophyImage from "./assets/trophy.png";
import skott_r_Image from "./assets/skott_r.png";
import skott_l_Image from "./assets/skott_l.png";
import kryssImage from "./assets/kryss.png";
import leaderboard_frameImage from "./assets/leaderboard_frame.png";
import coinImage from "./assets/coin.png";
import bombImage from "./assets/bomb.png";
import coinSoundFile from "./assets/pickupCoin.wav";
import explosionSoundFile from "./assets/explosion.wav";
import bulletSoundFile from "./assets/laserShoot.wav";
import nukeImage from "./assets/nuke.png";
import inventoryImage from "./assets/inventory_slot.png";
import highscoreBackgroundImage from "./assets/highscorebackground.png";
import darkImage from "./assets/dark.png";
import highscoreSoundFile from "./assets/highscore.wav";
import jumpSoundFile from "./assets/jump.wav";
import deathSoundFile from "./assets/death.wav";
import placenukeSoundFile from "./assets/placenuke.wav";
import diamondImage from "./assets/diamond.png";
import yesImage from "./assets/yes.png";
import gasImage from "./assets/gas.png";
import bunciSongSoundFile from "./assets/buncisong.wav";

import Inventory from "./inventory";
import Player from "./player";
import Bullet from "./bullet";
import Pickup from "./pickup";
import ScanKiller from "./scan_killer";
import NumberDisplay from "./number_display";
import Button from "./button";
import Bar from "./bar";

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
  //console.log("Game started");
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

  ctx.font = "bold 32px Courier, monospace";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("loading...", canvas.width / 2, canvas.height / 2);

  const { data, error } = await supabase.from("leaderboard").select("");
  if (error) {
    console.error("Error fetching leaderboard data:", error);
    return;
  }
  let leaderboard_data = data;
  let max_score = 0;
  let diamonds = 0;

  // console.log(clerk_instance.user.username);
  for (let entry of data) {
    if (entry.user == clerk_instance.user.username) {
      // console.log("User found in leaderboard:", entry.user);
      // console.log("Score:", entry.score);
      max_score = entry.score;
      diamonds = entry.diamonds;
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

  // console.log("Leaderboard data:", data);

  let running = false;
  let transition = false;
  let dead = false;
  let leaderboard_menu = false;
  let new_highscore = false;

  const img = await loadImage(bunciImage);

  const player_sprite = await loadImage(playerImage);

  const skott_r_sprite = await loadImage(skott_r_Image);
  const skott_l_sprite = await loadImage(skott_l_Image);

  const kryss_sprite = await loadImage(kryssImage);
  const coin_sprite = await loadImage(coinImage);
  const bomb_sprite = await loadImage(bombImage);
  const nuke_sprite = await loadImage(nukeImage);
  const highscore_background_sprite = await loadImage(highscoreBackgroundImage);
  const dark_sprite = await loadImage(darkImage);
  const diamond_sprite = await loadImage(diamondImage);
  const yes_sprite = await loadImage(yesImage);
  const inventory_sprite = await loadImage(inventoryImage);
  const gas_sprite = await loadImage(gasImage);

  const explosion = new ParticleEmitter(0, 0, ctx, 1, 5, "red", 1.5, false);

  const coinSound = new Audio(coinSoundFile);
  const explosionSound = new Audio(explosionSoundFile);
  explosionSound.volume = 0.3;

  const highscoreSound = new Audio(highscoreSoundFile);

  const jumpSound = new Audio(jumpSoundFile);

  const deathSound = new Audio(deathSoundFile);
  deathSound.volume = 0.4;

  const placenukeSound = new Audio(placenukeSoundFile);

  const leaderboard_frame_sprite = await loadImage(leaderboard_frameImage);

  const trophy_sprite = await loadImage(trophyImage);
  const trophySize = 60;

  const bunciSong = new Audio(bunciSongSoundFile);
  bunciSong.loop = true;
  bunciSong.volume = 0.25;

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
  let bomb = new Pickup(ctx, canvas.width, canvas.height, bomb_sprite, 450);
  let diamond = new Pickup(
    ctx,
    canvas.width,
    canvas.height,
    diamond_sprite,
    250
  );
  const nuke = new Pickup(ctx, canvas.width, canvas.height, nuke_sprite, 450);
  const nuke_keeper = new Inventory(nuke, canvas, ctx, inventory_sprite);
  const gas = new Pickup(ctx, canvas.width, canvas.height, gas_sprite, 150);

  const fuel_bar = new Bar(
    ctx,
    canvas.width - 15,
    15,
    250,
    20,
    "red",
    "black",
    200,
    200
  );

  const diamond_display = new NumberDisplay(
    ctx,
    20,
    60,
    35,
    "white",
    diamond_sprite
  );

  const score_display = new NumberDisplay(
    ctx,
    20,
    20,
    35,
    "white",
    coin_sprite
  );

  let scan_killers = [];

  let imageSizeFactor = 1;
  let a = 0;
  let y_off = 0;
  let y_off_speed = 0;

  const player = new Player(canvas, ctx, player_sprite, jumpSound);

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
        nuke.reset();
        coin.reset();
        bomb.reset();
        nuke_keeper.reset();
        diamond.reset();
        gas.reset();

        score_timer = 0;
        fuel_bar.setVal(200);
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
        nuke.reset();
        nuke_keeper.reset();
        diamond.reset();
        gas.reset();
        score_timer = 0;
        fuel_bar.setVal(200);

        // reset all bullets

        for (let bullet of bullets) {
          bullet.reset();
        }
        scan_killers = [];
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

    if (new_highscore) {
      ctx.drawImage(dark_sprite, 0, 0, canvas.width, canvas.height);

      let highscore_frame_width = 450;
      ctx.drawImage(
        highscore_background_sprite,
        canvas.width / 2 - highscore_frame_width / 2,
        canvas.height / 2 - highscore_frame_width / 2 - y_off,
        highscore_frame_width,
        highscore_frame_width
      );

      ctx.font = "bold 36px Courier, monospace";
      ctx.fillStyle = "#FFD700";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "New Highscore!",
        canvas.width / 2,
        canvas.height / 2 - 25 - y_off
      );
      ctx.fillStyle = "white";
      ctx.fillText(max_score, canvas.width / 2, canvas.height / 2 + 25 - y_off);
    }
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

  function nuke_now() {
    if (nuke_keeper.use()) {
      placenukeSound.currentTime = 0;
      placenukeSound.volume = 0.3;
      placenukeSound.play();
      //console.log("Nuke!");
      let killer = new ScanKiller(ctx);
      killer.moveTo(player.x, player.y);
      killer.start();
      scan_killers.push(killer);
    }
  }

  document.addEventListener("keypress", (e) => {
    console.log(e.code);
    if (e.code === "Space" && new_highscore) {
      new_highscore = false;
      return;
    }

    if (e.code === "Space" && !running) {
      transition = true;

      //console.log("go");
    }
    if ((e.key.toLowerCase() === "a" || e.code == "ArrowLeft") && running) {
      if (fuel_bar.val <= 0) {
        return;
      }
      player.left();
      fuel_bar.jump();
    }
    if ((e.key.toLowerCase() === "d" || e.code == "ArrowRight") && running) {
      if (fuel_bar.val <= 0) {
        return;
      }
      player.right();
      fuel_bar.jump();
    }
    if ((e.key.toLowerCase() === "w" || e.code == "ArrowUp") && running) {
      nuke_now();
    }
  });

  canvas.addEventListener("mousedown", async (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    console.log("Canvas coordinates:", canvasX, canvasY);

    if (revive_query) {
      accept_button.handleClick(canvasX, canvasY);
      decline_button.handleClick(canvasX, canvasY);
      return;
    }

    if (new_highscore) {
      new_highscore = false;
      return;
    }

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
      if (fuel_bar.val <= 0) {
        return;
      }
      player.left();
      fuel_bar.jump();
    }
    if (e.button === 0 && running && canvasX >= canvas.width / 2) {
      if (fuel_bar.val <= 0) {
        return;
      }
      player.right();
      fuel_bar.jump();
    }

    if (nuke_keeper.hitbox.mouseOver(canvasX, canvasY) && running) {
      nuke_now();
    }
  });

  let revive_query = false;

  const accept_button = new Button(
    ctx,
    canvas.width / 2 - 50,
    canvas.height / 2 + 30,
    80,
    yes_sprite,
    () => {
      // revive player
      player.reset();
      bullets = [];
      score_timer = 0;
      revive_query = false;
      accept_button.active = false;
      decline_button.active = false;
      diamonds -= 10;
      running = true;

      supabase
        .from("leaderboard")
        .update({ diamonds })
        .eq("user", clerk_instance.user.username)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error updating diamonds:", error);
          }
        });

      coinSound.currentTime = 0;
      coinSound.play();
    }
  );

  const decline_button = new Button(
    ctx,
    canvas.width / 2 + 50,
    canvas.height / 2 + 30,
    80,
    kryss_sprite,
    async () => {
      console.log("Player chose not to revive");
      accept_button.active = false;
      decline_button.active = false;

      revive_query = false;
      dead = true;
      imageSizeFactor = 1;
      a = 0;
      y_off = 0;
      y_off_speed = 0;
      transition = false;
      running = false;
      if (score > max_score) {
        highscoreSound.currentTime = 0;
        highscoreSound.play();
        new_highscore = true;
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
      } else {
        deathSound.currentTime = 0;
        deathSound.play();
      }
      score = 0;
      score_timer = 0;
      deathScreen();
      requestAnimationFrame(gameLoop);
      return;
    }
  );

  accept_button.active = false;
  decline_button.active = false;

  function revive_shop() {
    ctx.drawImage(dark_sprite, 0, 0, canvas.width, canvas.height);

    let frame_width = 450;
    ctx.drawImage(
      highscore_background_sprite,
      canvas.width / 2 - frame_width / 2,
      canvas.height / 2 - frame_width / 2,
      frame_width,
      frame_width
    );

    accept_button.draw();
    decline_button.draw();
    ctx.font = "bold 26px Courier, monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Revive for 10 diamonds?",
      canvas.width / 2,
      canvas.height / 2 - 45
    );
  }

  let del = 0;

  let dT = 0.005;
  let score = 0;
  let score_timer = 0;

  let lastTime = Date.now();
  let l = Date.now();

  let loopId = 0;

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

    if (running) {
      score_display.setValue(score);
    } else {
      score_display.setValue(max_score);
    }

    score_display.draw();
    diamond_display.setValue(diamonds);
    diamond_display.draw();

    if (revive_query) {
      revive_shop();
      cancelAnimationFrame(loopId);
      requestAnimationFrame(gameLoop);
      return;
    }

    if (leaderboard_menu) {
      leaderboardScreen();
      cancelAnimationFrame(loopId);

      requestAnimationFrame(gameLoop);
      return;
    }

    if (dead) {
      deathScreen();
      cancelAnimationFrame(loopId);
      requestAnimationFrame(gameLoop);
      return;
    }
    if (!running) {
      splashScreen();
      cancelAnimationFrame(loopId);

      requestAnimationFrame(gameLoop);
      return;
    }

    if (bunciSong.paused) {
      bunciSong.play();
    }

    if (Date.now() - l >= 1000) {
      score++;
      score_timer++;
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
      if (score_timer % 10 == 0 && !coin.alive) {
        coin.alive = true;
      }

      if ((score_timer + 5) % 8 == 0 && !gas.alive) {
        gas.alive = true;
      }

      if (score_timer % 30 == 0 && !bomb.alive) {
        bomb.alive = true;
      }

      if ((score + 30) % 50 == 0 && !nuke.alive && nuke_keeper.count < 9) {
        nuke.alive = true;
      }

      if (score_timer % 60 == 0 && !diamond.alive) {
        diamond.alive = true;
      }
    }

    // //display score
    // ctx.font = "bold 24px Courier, monospace";
    // ctx.fillStyle = "black";
    // ctx.textAlign = "center";
    // ctx.textBaseline = "top";
    // ctx.fillText("Score: " + score, canvas.width / 2, 20);
    // ctx.fillText("Best: " + max_score, canvas.width / 2, 50);

    if (coin.alive) {
      coin.update(dT);
      coin.draw();
    }

    if (bomb.alive) {
      bomb.update(dT);
      bomb.draw();
    }

    if (nuke.alive) {
      nuke.update(dT);
      nuke.draw();
    }

    if (diamond.alive) {
      diamond.update(dT);
      diamond.draw();
    }

    if (gas.alive) {
      gas.update(dT);
      gas.draw();
    }

    if (coin.alive && player.collidesWithPickup(coin)) {
      //console.log("Player collected coin");
      coin.reset();
      score += 5;
      coinSound.currentTime = 0;

      coinSound.play();
    }

    if (bomb.alive && player.collidesWithPickup(bomb)) {
      //console.log("Player hit bomb");
      explosion.moveTo(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2);
      explosion.burst(300);
      bomb.reset();

      explosionSound.currentTime = 0;
      explosionSound.play();

      bullets = bullets.filter(() => Math.random() < 0.5);
    }

    if (diamond.alive && player.collidesWithPickup(diamond)) {
      //console.log("Player collected diamond");
      diamond.reset();

      diamonds++;
      supabase
        .from("leaderboard")
        .update({ diamonds })
        .eq("user", clerk_instance.user.username)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error updating diamonds:", error);
          }
        });

      coinSound.currentTime = 0;
      coinSound.play();
    }

    if (nuke.alive && player.box.intersectsWith(nuke.box)) {
      nuke.reset();
      coinSound.currentTime = 0;
      coinSound.play();
      nuke_keeper.add();
    }

    if (gas.alive && player.box.intersectsWith(gas.box)) {
      gas.reset();
      fuel_bar.add(100);
    }

    explosion.emit();
    explosion.updateParticles();

    if (del > 300) {
      for (let bullet of bullets) {
        bullet.draw();
        bullet.update(dT);
        if (player.collidesWithBullet(bullet) || player.outOfBounds()) {
          console.log(diamonds);
          if (diamonds >= 10) {
            accept_button.active = true;
            decline_button.active = true;
            revive_query = true;
            running = false;

            cancelAnimationFrame(loopId);
            requestAnimationFrame(gameLoop);
            return;
          }
          //console.log("Player hit by bullet");
          dead = true;
          imageSizeFactor = 1;
          a = 0;
          y_off = 0;
          y_off_speed = 0;
          transition = false;
          running = false;
          if (score > max_score) {
            highscoreSound.currentTime = 0;
            highscoreSound.play();
            new_highscore = true;
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
          } else {
            deathSound.currentTime = 0;
            deathSound.play();
          }
          score = 0;
          score_timer = 0;
          deathScreen();
          cancelAnimationFrame(loopId);

          requestAnimationFrame(gameLoop);
          return;
        }
      }
    }

    fuel_bar.draw();

    for (let killer of scan_killers) {
      killer.update(dT, bullets);
    }
    bullets = bullets.filter((bullet) => !bullet.remove);

    player.update(dT);
    player.draw();

    nuke_keeper.draw();

    loopId = requestAnimationFrame(gameLoop);
  }
  loopId = requestAnimationFrame(gameLoop);
}
