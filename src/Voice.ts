import { Score } from './Score.js';
import { Note } from "./Note.js";
import { Analyzer } from "./Analyzer.js";
import { Layout } from "./Layout.js";
import { Pitch } from "./Pitch.js";

export class Voice {

    /**
     * 
     * @returns true iff the voice contains notes
     */
    isEmpty(): boolean { return this.notes.length == 0; }

    /**
     * returns notes between time t1 and time t2
     */
    getNotesBetween(t1: number, t2: number): Note[] {
        let result = [];
        for (const timeStep of this.timeSteps) {
            if ((t1 <= timeStep.t) && (timeStep.t < t2))
                result = result.concat(timeStep.notes);
        }
        return result;
    }

    /**
     * 
     * @param note 
     * @description remove the note from the voice, if that note belongs to the voice
     */
    removeNote(note: Note) {
        const index = this.notes.indexOf(note);
        if (index > -1) this.notes.splice(index, 1);
    }

    static voiceColors = ["black", "red", "orange", "green", "blue", "Pink", "SaddleBrown"] /*["black", "DarkSlateGrey", "gray",  "lightgray", 
    "red", "orange", "DarkOrange", "GoldenRod", 
    "brown", "Maroon", "Peru", "SaddleBrown",
    "Pink", "RosyBrown", "SandyBrown", "Thistle"];*/

    notes: Note[] = [];
    timeSteps: TimeStep[] = [];



    constructor(readonly color: string) { this.color = color; }

    draw() { for (const note of this.notes) note.draw(); }


    addNote(note: Note) {
        note.setColor(this.color);
        note.setVoice(this);
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

    /**
     * 
     * @param x 
     * @param pitch 
     * @returns true if there is a note at abscisse x (~) and at pitch pitch
     */
    contains(x: number, pitch: Pitch): boolean {
        for (let note of this.notes) {
            if (Math.abs(note.x - x) < 2 && (note.pitch.accidental == pitch.accidental) && (note.pitch.value == pitch.value))
                return true;
        }
        return false;
    }
}






export class TimeStep {

    private _x: number;
    t: number = undefined;
    notes: Note[];
    private _duration = undefined;

    isDot() {
        if (equalReal(this._duration, 0.75)) return true;
        if (equalReal(this._duration, 0.75 / 2)) return true;
        if (equalReal(this._duration, 0.75 / 4)) return true;
        if (equalReal(this._duration, 0.75 / 8)) return true;
        return false;
    }

    isDoubleDot() {
        if (equalReal(this._duration, 0.875)) return true;
        if (equalReal(this._duration, 0.875 / 2)) return true;
        if (equalReal(this._duration, 0.875 / 4)) return true;
        if (equalReal(this._duration, 0.875 / 8)) return true;
        return false;
    }


    constructor(note: Note) {
        this._x = note.x;
        this.notes = [note];
    }



    isSilence(): boolean { return this.notes.every((note) => note.isSilence()); }

    getPitchs(): string {
        if (this.notes.length > 1) {
            let s = "<";
            for (let note of this.notes)
                s += note.pitchName + " ";
            s += ">";
            return s;
        }
        else return this.notes[0].pitchName;

    }

    set duration(d: number) {
        this._duration = d;

        for (let note of this.notes)
            note.duration = d;

    }

    get duration() {
        return this._duration;
    }

    /**
     * compute the average of the x of the notes
     */
    get x(): number {
        let s = 0;
        for (const note of this.notes) s += note.x;
        return s / this.notes.length;
    }


    get xLine() {
        const x = this.x;

        const notesAroundTheVerticalLine = () => {
            let minX = 1000000;
            let maxX = -1000000;
            for (const note of this.notes) {
                minX = Math.min(note.x, minX);
                maxX = Math.max(note.x, maxX);
            }
            return Math.abs(minX - maxX) < Layout.NOTERADIUSX / 2;
        }

        if (notesAroundTheVerticalLine())
            return x + Layout.NOTERADIUSX;
        else
            return x;
    }


    get yDown() {
        let y = -100000;
        for (const note of this.notes) {
            y = Math.max(y, Layout.getY(note.pitch));
        }
        return y;
    }



    get yTop() {
        let y = 100000;
        for (const note of this.notes) {
            y = Math.min(y, Layout.getY(note.pitch));
        }
        return y;
    }

    get yRythm() { return this.yTop + Layout.RYTHMY; }

}

function getTimeSteps(voice: Voice): TimeStep[] {
    let timeSteps: TimeStep[] = [];
    let previousNote: Note = undefined;
    voice.notes.sort((n1: Note, n2: Note) => n1.x - n2.x);

    for (const note of voice.notes) {
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



function equalReal(v: number, v2: number) { return Math.abs(v - v2) < 0.001; }