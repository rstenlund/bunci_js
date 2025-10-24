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

function sib() {
  document.getElementById("sign-in").hidden = false;
}

if (clerk.isSignedIn) {
  inject();
  document.getElementById("homepage").hidden = true;

  document.getElementById("app").innerHTML = `
    <div id="user-button"></div>
    <p>a and d for movement, w to use pickup</p>
    <canvas id="gameCanvas" width="1000" height="700"></canvas>
    
  `;
  runGame(clerk);

  const userButtonDiv = document.getElementById("user-button");

  clerk.mountUserButton(userButtonDiv);
} else {
  inject();
  document.getElementById("homepage").hidden = false;
  document.getElementById("app").innerHTML = "";

  const signInDiv = document.getElementById("sign-in");

  clerk.mountSignIn(signInDiv);
}
