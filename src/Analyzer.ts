import { Drawing } from './Drawing.js';
import { Voice, TimeStep } from "./Voice.js";
import { Layout } from "./Layout.js";

/**
 * this class analyses a voice and infers the rhythm.
 */
export class Analyzer {
    private voice: Voice;

    analyze(voice: Voice) {
        this.voice = voice;
        this.computeTime(this.voice.timeSteps);
        this._draw();
    }

    /**
     * 
     * @param timeSteps an array of timeSteps. Each timestep is a collection of notes played at the same time.
     */
    computeTime(timeSteps: TimeStep[]) {
        function getEndByDefault(t) { return Math.floor(t) + 1; }

        for (let ts of timeSteps)
            ts.t = Layout.getT(ts.x);

        for (let i = 0; i < timeSteps.length; i++) {
            if (i < timeSteps.length - 1)
                timeSteps[i].duration = getDuration(timeSteps[i + 1].t - timeSteps[i].t);
            else
                timeSteps[i].duration = getDuration(getEndByDefault(timeSteps[i].t) - timeSteps[i].t);
        }
    }



    /**
     * draw the extra information of the rhythm!
     */
    _draw() {
        function drawRythmLine(timeStep: TimeStep) {
            if (timeStep.duration >= 0.25)
                return;

            Drawing.lineRythm(timeStep.xLine, timeStep.yRythm, timeStep.xLine + Layout.RYTHMX, timeStep.yRythm);

            if (timeStep.duration > 0.25 / 4) return;

            Drawing.lineRythm(timeStep.xLine, timeStep.yRythm + Layout.RYTHMLINESSEP, timeStep.xLine + Layout.RYTHMX, timeStep.yRythm + Layout.RYTHMLINESSEP);

            if (timeStep.duration > 0.25 / 8) return;
        }

        for (let timeStep of this.voice.timeSteps) {
            if (!timeStep.isSilence()) {
                if (timeStep.duration < 1)
                    Drawing.line(timeStep.xLine, timeStep.yDown, timeStep.xLine, timeStep.yRythm);

                drawRythmLine(timeStep);
            }

            if (timeStep.isDot())
                for (let note of timeStep.notes)
                    Drawing.circle(note.x + Layout.NOTERADIUS * 3 / 2, note.y, 3);

        }

        for (let i = 0; i < this.voice.timeSteps.length; i++) {
            if (this.voice.isTrioletStartingFrom(i))
                Drawing.text((this.voice.timeSteps[i].x + this.voice.timeSteps[i + 2].x) / 2,
                    this.voice.timeSteps[i].yRythm - 2, "3");
        }

        let drawExtraLine = (x: number, i: number) => {
            const y = Layout.getY(i);
            const FACT = 1.8;
            Drawing.line(x - Layout.NOTERADIUS * FACT, y, x + Layout.NOTERADIUS * FACT, y);
        }

        for (let note of this.voice.notes) if (!note.isSilence()) {
            if (note.pitch.value == 0)
                drawExtraLine(note.x, 0);
            for (let i = -10; i >= note.pitch.value; i -= 2)
                drawExtraLine(note.x, i);
            for (let i = 10; i <= note.pitch.value; i += 2)
                drawExtraLine(note.x, i);
        }

    }


}




/**
 * 
 * @param dt 
 * @returns the real duration corresponding to dt. (E.g. if dt == 1, returns 1 (whole note
 * if dt is almost 1/2, returns 1/2 etc.)
 */
function getDuration(dt: number): number {
    let score = 1000000;
    let result = 1;

    function test(v) {
        let newScore = Math.abs(v - dt);
        if (newScore < score) {
            result = v;
            score = newScore;
        }
    }

    let possibleValues = [0.25 / 4, 0.25 / 3, 0.25 / 2, 0.25, 0.5, 0.75, 0.25 / 3, 1, 0.75 / 2, 0.75 / 4];

    for (let v of possibleValues)
        test(v);


    return result;
}







/**
 * 
 * @param v 
 * @param v2
 * @returns true if v and v2 are (almost) equal 
 */
function equalReal(v, v2) {
    return Math.abs(v - v2) < 0.001;
}