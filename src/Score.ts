import { Drawing } from './Drawing.js';
import { Layout } from './Layout.js';
import { Voice } from './Voice.js';
import { Note } from './Note.js';

export class Score {
    
    voices: Voice[] = [];


    constructor() {
        for (let c of Voice.voiceColors)
            this.voices.push(new Voice(c));
    }

    removeNote(note: Note) {
        for (let voice of this.voices) voice.removeNote(note);
    }


    _draw() {
        clear();


        for (let voice of this.voices) voice.draw();
        drawLandMark();
        drawLines();
        
    }

    update() {
        clear();
        for (let voice of this.voices) voice.update();
        drawLines();
        drawLandMark();
    }
}


function clear() {
    document.getElementById("svg").innerHTML = "";
    document.getElementById("svg").appendChild(newRect(0, 0, Layout.WIDTH, Layout.HEIGHT));
}


function drawLines() {
    for (let i of [-20, -18, -16, -14, -12, 0, 12, 14, 16, 18, 20]) {
        let y = Layout.getY(i);
        Drawing.lineLight(0, y, Layout.WIDTH, y);
    }
    for (let i of [2, 4, 6, 8, 10]) {
        let y = Layout.getY(i);
        Drawing.line(0, y, Layout.WIDTH, y);
    }

    for (let i of [-2, -4, -6, -8, -10]) {
        let y = Layout.getY(i);
        Drawing.line(0, y, Layout.WIDTH, y);
    }

    for (let t = 0; t < 30; t++) {
        let x = Layout.getX(t) - 2 * Layout.NOTERADIUS;
        Drawing.line(x, Layout.getY(-10), x, Layout.getY(10));
    }

}


function drawLandMark() {
    for (let t = 0; t < 50; t += 0.25) {
        const x = Layout.getX(t);
        Drawing.lineLight(x, 0, x, Layout.LANDMARKHEIGHT);
    }
}


function newRect(x1, y1, x2, y2) {
    var aRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    aRect.setAttribute('id', "svgBackground");
    aRect.setAttribute('x', x1);
    aRect.setAttribute('y', y1);
    aRect.setAttribute('width', x2);
    aRect.setAttribute('height', y2);
    aRect.setAttribute('fill', "white");
    return aRect;
}






