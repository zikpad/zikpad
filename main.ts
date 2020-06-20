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


function load() {



  document.getElementById("svg").setAttribute("height", Layout.HEIGHT.toString());

  let score = new Score();
  document.getElementById("lilypond").addEventListener("click", () =>
    (<HTMLInputElement>document.getElementById("lilypond")).select());
  new InteractionScore(score);

  window.onresize = resize;

  resize();
  //https://ourcodeworld.com/articles/read/286/how-to-execute-a-python-script-and-retrieve-output-data-and-errors-in-node-js
  //-> does not work

  //https://blog.logrocket.com/electron-ipc-response-request-architecture-with-typescript/

  /*
    document.getElementById("validate").addEventListener("click", () => {
      KeyBoardTyping.write((<HTMLInputElement>document.getElementById("lilypond")).value);
  });*/

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



