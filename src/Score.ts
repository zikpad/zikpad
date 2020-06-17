import { Drawing } from './Drawing.js';
import { Layout } from './Layout.js';
import { Voice } from './Voice.js';

export class Score {
    voices: Voice[] = [new Voice()];

    _draw() {
        clear();
        for (let voice of this.voices) voice.draw();
        drawLines();
        drawLandMark();
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

}


function drawLandMark() {
    for (let t = 0; t < 1; t += 0.25) {
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






