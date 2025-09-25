import { Clerk } from "@clerk/clerk-js";
import "./style.css";
import runGame from "./game.js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerk = new Clerk(clerkPubKey);
await clerk.load();

if (clerk.isSignedIn) {
  document.getElementById("app").innerHTML = `
    <div id="user-button"></div>
    <canvas id="gameCanvas" width="1000" height="700"></canvas>
  `;
  runGame(clerk);

  const userButtonDiv = document.getElementById("user-button");

  clerk.mountUserButton(userButtonDiv);
} else {
  document.getElementById("app").innerHTML = `
  <h1 style="width: 20vw; margin-bottom: 20px; text-align: center; font-family: 'Courier New', monospace; font-size: 40px;">bunci</h1>
    <div id="sign-in"></div>

  `;

  const signInDiv = document.getElementById("sign-in");

  clerk.mountSignIn(signInDiv);
}
