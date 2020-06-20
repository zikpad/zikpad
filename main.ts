import { Lilypond } from './src/Lilypond.js';
//import Vex from 'vexflow';
//const VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "vf".

import { InteractionScore } from "./src/Interaction.js"
import { Score } from "./src/Score.js";
import { Layout } from "./src/Layout.js";

//const { ipcRenderer } = require('electron')
//const { ipcRenderer } = require('electron')


window.onload = load;

function resize() {
  document.getElementById("svg-wrapper").style.height = (window.innerHeight - document.getElementById("palette").clientHeight - 16).toString();
}



let score = new Score();

function load() {
  document.getElementById("svg").setAttribute("height", Layout.HEIGHT.toString());
  document.getElementById("lilypond").addEventListener("click", () =>
    (<HTMLInputElement>document.getElementById("lilypond")).select());
  new InteractionScore(score);

  window.onresize = resize;

  resize();

  try {
    const ipc = require('electron').ipcRenderer;

    ipc.on("new", () => load());
    ipc.on("open", (evt, data) => {
      load();
      Lilypond.getScore(score, data);
      new InteractionScore(score);
    });
    ipc.on("save", () => ipc.send("save", Lilypond.getCode(score)));
  }
  catch (e) {

  }

}



