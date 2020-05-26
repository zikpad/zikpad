import { Lilypond } from './Lilypond.js';
import { Note } from './Note.js';
import { Layout } from './Layout.js';

export class Score {
    notes: Note[] = [];

    draw() {
        clear();
        drawLines();
        for (let note of this.notes) note.draw();

        document.getElementById("svgBackground").addEventListener("click", (evt) => {
            console.log("click")
            this.addNote(new Note(evt.x, Layout.getPitch(evt.y)));
            this.draw();
            this.update();
        });

        (<any> document.getElementById("svg")).score = this;
    }

    addNote(note) {
        this.notes.push(note);
    }

    update() {
        (<HTMLInputElement>document.getElementById("lilypond")).value = Lilypond.getLilypond(this);
    }
}



function clear() {
    document.getElementById("svg").innerHTML = "";
    document.getElementById("svg").appendChild(newRect(0, 0, 800, 300));
}

function drawLines() {
    for (let i of [2, 4, 6, 8, 10]) {
        let y = Layout.getY(i);
        document.getElementById("svg").appendChild(newLine(0, y, 800, y));
    }

}


function newLine(x1, y1, x2, y2) {
    var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    aLine.setAttribute('x1', x1);
    aLine.setAttribute('y1', y1);
    aLine.setAttribute('x2', x2);
    aLine.setAttribute('y2', y2);
    aLine.setAttribute('stroke', "black");
    aLine.setAttribute('stroke-width', "1");
    return aLine;
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