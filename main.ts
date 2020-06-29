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

function init() {
  score = new Score();
  document.getElementById("svg").setAttribute("height", Layout.HEIGHT.toString());
  document.getElementById("lilypond").addEventListener("click", () =>
    (<HTMLInputElement>document.getElementById("lilypond")).select());
  new InteractionScore(score);

  window.onresize = resize;

  resize();

  document.getElementById("downloadLilypond").style.visibility = "hidden"; 
  try {
    const ipc = require('electron').ipcRenderer;

    ipc.on("new", () => init());
    ipc.on("open", (evt, data) => {
      init();
      Lilypond.getScore(score, data);
      new InteractionScore(score);
    });
    ipc.on("save", () => ipc.send("save", Lilypond.getCode(score)));
  }
  catch (e) {
    document.getElementById("downloadLilypond").style.visibility = "visible";
    document.getElementById("downloadLilypond").onclick = () => {
      download("myscore.ly", Lilypond.getCode(score));
    };


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

