import { KeyEvent } from './src/KeyEvent.js';
import { Lilypond } from './src/Lilypond.js';
//import Vex from 'vexflow';
//const VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "vf".

import { InteractionScore } from "./src/Interaction.js"
import { Score } from "./src/Score.js";
import { Layout } from "./src/Layout.js";

//const { ipcRenderer } = require('electron')
//const { ipcRenderer } = require('electron')


window.onload = init;


/**
 * when the window is resized
 */
function resize() {
  document.getElementById("svg-wrapper").style.height =
    (window.innerHeight - document.getElementById("palette").clientHeight - 16).toString();
}



let score = new Score();
let interactionScore;

function init() {
  score = new Score();
  document.getElementById("svg").setAttribute("height", Layout.HEIGHT.toString());
  document.getElementById("lilypond").addEventListener("click", () =>
    (<HTMLInputElement>document.getElementById("lilypond")).select());
  interactionScore = new InteractionScore(score);

  window.onresize = resize;

  resize();

  document.getElementById("downloadLilypond").style.visibility = "hidden";
  try {
    const ipc = require('electron').ipcRenderer;

    ipc.on("new", () => init());
    ipc.on("open", (evt, data) => {
      init();
      Lilypond.getScore(score, data);
      interactionScore = new InteractionScore(score);
    });
    ipc.on("save", () => ipc.send("save", Lilypond.getCode(score)));

    ipc.on("undo", () => interactionScore.undo());
    ipc.on("redo", () => interactionScore.redo());
  }
  catch (e) {
    document.getElementById("downloadLilypond").style.visibility = "visible";
    document.getElementById("downloadLilypond").onclick = () => {
      download("myscore.ly", Lilypond.getCode(score));
    };

    document.addEventListener("keydown", (evt) => {
      if (evt.ctrlKey && evt.keyCode == KeyEvent.DOM_VK_Z) {
        interactionScore.undo();
      }
      else if (evt.ctrlKey && evt.shiftKey && evt.keyCode == KeyEvent.DOM_VK_Z) {
        interactionScore.redo();
      }
    });

  }

}



function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Start file download.

