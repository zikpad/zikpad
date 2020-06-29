import { Note } from "./Note.js";
import { Analyzer } from "./Analyzer.js";
import { Layout } from "./Layout.js";

export class Voice {
    isEmpty(): boolean {
        return this.notes.length == 0;
    }
    
    getNotesBetween(t1: number, t2: number): Note[] {
        let result = [];
        for (let timeStep of this.timeSteps) {
            if ((t1 <= timeStep.t) && (timeStep.t < t2))
                result = result.concat(timeStep.notes);
        }
        return result;
    }

    removeNote(note: Note) {
        const index = this.notes.indexOf(note);
        if (index > -1) {
            this.notes.splice(index, 1);
        }
    }

    static voiceColors = ["black", "red", "brown", "orange", "green"];

    notes: Note[] = [];
    timeSteps: TimeStep[] = [];

    readonly color: string;

    constructor(color: string) {
        this.color = color;
    }

    draw() {
        for (let note of this.notes) note.draw();
    }


    addNote(note: Note) {
        note.setColor(this.color);
        this.notes.push(note);
    }

    update() {
        let analyzer = new Analyzer();
        this.timeSteps = getTimeSteps(this);
        this.draw();
        analyzer.analyze(this);
       // (<HTMLInputElement>document.getElementById("lilypond")).value = analyzer.getLilypond();
    }

    isTrioletStartingFrom(i) {
        return this.timeSteps.length - i > 3 && equalReal(this.timeSteps[i].duration, 0.25 / 3)
            && equalReal(this.timeSteps[i + 1].duration, 0.25 / 3)
            && equalReal(this.timeSteps[i + 2].duration, 0.25 / 3);
    }
}






export class TimeStep {

    _x: number;
    t: number = undefined;
    notes: Note[];
    _duration = undefined;

    isDot() {
        if (equalReal(this._duration, 0.75)) return true;
        if (equalReal(this._duration, 0.75 / 2)) return true;
        if (equalReal(this._duration, 0.75 / 4)) return true;
        if (equalReal(this._duration, 0.75 / 8)) return true;
        return false;
    }


    constructor(note: Note) {
        this._x = note.x;
        this.notes = [note];
    }



    isSilence(): boolean {
        return this.notes.every((note) => note.isSilence());
    }

    getPitchs() {
        if (this.notes.length > 1) {
            let s = "<";
            for (let note of this.notes)
                s += note.pitchName + " ";
            s += ">";
            return s;
        }
        else return this.notes[0].pitchName;

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
        for (let note of this.notes)
            s += note.x;
        return s / this.notes.length;
    }


    get xLine() {
        const x = this.x;

        let minX = 1000000;
        let maxX = -1000000;
        for (let note of this.notes) {
            minX = Math.min(note.x, minX);
            maxX = Math.max(note.x, maxX);
        }

        if (Math.abs(minX - maxX) < Layout.NOTERADIUS / 2)
            return x + Layout.NOTERADIUS;
        else
            return x;
    }


    get yDown() {
        let y = -100000;
        for (let note of this.notes) {
            y = Math.max(y, Layout.getY(note.pitch));
        }
        return y;
    }



    get yTop() {
        let y = 100000;
        for (let note of this.notes) {
            y = Math.min(y, Layout.getY(note.pitch));
        }
        return y;
    }

    get yRythm() {
        return this.yTop + Layout.RYTHMY;
    }

}

function getTimeSteps(score): TimeStep[] {
    let timeSteps: TimeStep[] = [];
    let previousNote: Note = undefined;
    score.notes.sort((n1: Note, n2: Note) => n1.x - n2.x);

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



function equalReal(v: number, v2: number) {
    return Math.abs(v - v2) < 0.001;
}