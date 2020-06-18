import { Drawing } from './Drawing.js';
import { Voice, TimeStep } from "./Voice.js";
import { Note } from "./Note.js";
import { Layout } from "./Layout.js";

export class Analyzer {
    voice: Voice;

    analyze(voice: Voice) {
        this.voice = voice;
        this.computeTime(this.voice.timeSteps);
        this._draw();
    }


    computeTime(timeSteps: TimeStep[]) {
        if (timeSteps.length == 0) return;

        for (let ts of timeSteps) {
            ts.t = (ts.x - timeSteps[0].x) / (Layout.WIDTHONE - Layout.XBEGIN);
        }

        let t = 0;
        for (let i = 0; i < timeSteps.length; i++) {
            if (i < timeSteps.length - 1)
                timeSteps[i].duration = getDuration(timeSteps[i + 1].t - timeSteps[i].t);
            else
                timeSteps[i].duration = getDuration(1 - timeSteps[i].t);

            t += timeSteps[i].duration;
            timeSteps[i].t = t;

        }
    }




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
    }

    getLilypond(): string {
        let s = "";
        let i = 0;
        while (i < this.voice.timeSteps.length) {
            if (this.voice.isTrioletStartingFrom(i)) {
                s += `\\tuplet 3/2 { ${this.voice.timeSteps[i].getPitchs()}8 ${this.voice.timeSteps[i + 1].getPitchs()} ${this.voice.timeSteps[i + 2].getPitchs()}} `;
                i += 3;
            }
            else {
                s += this.voice.timeSteps[i].getPitchs();
                s += getDurationLilypond(this.voice.timeSteps[i].duration);

                if (this.voice.timeSteps[i].isDot())
                    s += ".";
                s += " ";
                i++;

            }
        }



        /* s += " ";
         for (let timestep of this.score.timeSteps) {
             s += `${timestep._duration} `;
         }*/

        return s;
    }
}





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





function getDurationLilypond(duration) {
    if (duration >= 1) return "1";
    if (duration >= 0.5) return "2";
    if (duration >= 0.25) return "4";
    if (duration >= 0.25 / 2) return "8";
    console.log(duration)
    return "16";
}


function equalReal(v, v2) {
    return Math.abs(v - v2) < 0.001;
}