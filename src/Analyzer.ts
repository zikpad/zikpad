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


        function getEnd(t) {
            return Math.floor(t) + 1;
        }

        if (timeSteps.length == 0) return;

        for (let ts of timeSteps) {
            ts.t = Layout.getT(ts.x);
        }

        let t = 0;
        for (let i = 0; i < timeSteps.length; i++) {
            if (i < timeSteps.length - 1)
                timeSteps[i].duration = getDuration(timeSteps[i + 1].t - timeSteps[i].t);
            else
                timeSteps[i].duration = getDuration(getEnd(timeSteps[i].t) - timeSteps[i].t);

            timeSteps[i].t = t;
            t += timeSteps[i].duration;


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








function equalReal(v, v2) {
    return Math.abs(v - v2) < 0.001;
}