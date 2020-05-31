import { Drawing } from './Drawing.js';
import { Analyzer } from './Analyzer.js';
import { Note } from './Note.js';
import { Layout } from './Layout.js';

export class Score {
    notes: Note[] = [];
    timeSteps: TimeStep[] = [];

    _draw() {
        clear();
        for (let note of this.notes) note.draw();
        drawLines();
    }

    addNote(note) {
        this.notes.push(note);
    }

    update() {
        let analyzer = new Analyzer();
        this.timeSteps = getTimeSteps(this);
        this._draw();
        analyzer.analyze(this);
        (<HTMLInputElement>document.getElementById("lilypond")).value = analyzer.getLilypond();
    }
}



function clear() {
    document.getElementById("svg").innerHTML = "";
    document.getElementById("svg").appendChild(newRect(0, 0, Layout.WIDTH, Layout.HEIGHT));
}

function drawLines() {
    for (let i of [-8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]) {
        let y = Layout.getY(i);
        Drawing.lineLight(0, y, Layout.WIDTH, y);
    }
    for (let i of [2, 4, 6, 8, 10]) {
        let y = Layout.getY(i);
        Drawing.line(0, y, Layout.WIDTH, y);
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







export class TimeStep {
    isDot() {
        if(equalReal(this._duration, 0.75)) return true;
        if(equalReal(this._duration, 0.75/2)) return true;
        if(equalReal(this._duration, 0.75/4)) return true;
        if(equalReal(this._duration, 0.75/8)) return true;
        return false;
    }
    _x: number;
    t = undefined;
    notes: Note[];
    _duration = undefined;

    constructor(note: Note) {
        this._x = note.x;
        this.notes = [note];
    }

    getPitchs() {
        if (this.notes.length > 1) {
            let s = "<";
            for (let note of this.notes)
                s += note.getPitchName() + " ";
            s += ">";
            return s;
        }
        else return this.notes[0].getPitchName();

    }

    set duration(d) {
        this._duration = d;

        for (let note of this.notes)
            note.duration = d;

    }

    get duration() {
        return this._duration;
    }


    get x() {
        let s = 0;
        for(let note of this.notes)
            s += note.x;
        return s / this.notes.length;
    }
}

function getTimeSteps(score): TimeStep[] {
    let timeSteps: TimeStep[] = [];
    let previousNote: Note = undefined;
    score.notes.sort((n1, n2) => n1.x - n2.x);

    for (let note of score.notes) {
        if (previousNote) {
            if (Math.abs(note.x - previousNote.x) < 2 * Layout.NOTERADIUS)
                timeSteps[timeSteps.length - 1].notes.push(note);
            else {
                previousNote = note;
                timeSteps.push(new TimeStep(note));
            }
        } else {
            timeSteps.push(new TimeStep(note));
            previousNote = note;
        }
    }
    return timeSteps;
}



function equalReal(v: number , v2: number) {
    return Math.abs( v -  v2) < 0.001;
}