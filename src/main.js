import { Clerk } from "@clerk/clerk-js";
import "./style.css";
import runGame from "./game.js";
import { inject } from "@vercel/analytics";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerk = new Clerk(clerkPubKey);
await clerk.load();

document.body.onload = () => {
  inject();
};

if (clerk.isSignedIn) {
  inject();
  document.getElementById("app").innerHTML = `
    <div id="user-button"></div>
    <canvas id="gameCanvas" width="1000" height="700"></canvas>
  `;
  runGame(clerk);

  const userButtonDiv = document.getElementById("user-button");

  clerk.mountUserButton(userButtonDiv);
} else {
  inject();
  document.getElementById("app").innerHTML = `
  <h1 id="welcome">Welcome to bunci!</h1>
    <div id="sign-in"></div>

  `;

  const signInDiv = document.getElementById("sign-in");

  clerk.mountSignIn(signInDiv);
}
