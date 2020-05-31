import { Drawing } from './Drawing.js';
import { Score, TimeStep } from "./Score.js";
import { Note } from "./Note.js";
import { Layout } from "./Layout.js";

export class Analyzer {
    score: Score;
    analyze(score: Score) {
        this.score = score;
        this.computeTime(this.score.timeSteps);
        this._draw();
    }


    computeTime(timeSteps: TimeStep[]) {
        if (timeSteps.length == 0) return;

        for (let ts of timeSteps) {
            ts.t = (ts.x - timeSteps[0].x) / (Layout.WIDTH - timeSteps[0].x);
        }


        for (let i = 0; i < timeSteps.length; i++) {
            if (i < timeSteps.length - 1)
                timeSteps[i].duration = getDuration(timeSteps[i + 1].t - timeSteps[i].t);
            else
                timeSteps[i].duration = getDuration(1 - timeSteps[i].t);
        }
    }



    _draw() {
        function drawRythmLine(timeStep) {
            if (timeStep.duration >= 0.25)
                return;

            Drawing.lineThick(timeStep.x, Layout.RYTHMY, timeStep.x + 10, Layout.RYTHMY);

            if (timeStep.duration >= 0.25 / 2) return;

            Drawing.lineThick(timeStep.x, Layout.RYTHMY + Layout.RYTHMLINESSEP, timeStep.x + 10, Layout.RYTHMY + Layout.RYTHMLINESSEP);

            if(timeStep.duration >= 0.25/4) return;
        }

        for (let timeStep of this.score.timeSteps) {
            if (timeStep.duration < 1)
                Drawing.line(timeStep.x, Layout.getY(10), timeStep.x, Layout.RYTHMY);

            drawRythmLine(timeStep);

            if(timeStep.isDot())
                for(let note of timeStep.notes)
                    Drawing.circle(note.x + Layout.NOTERADIUS*3/2, note.y, 3);

        }
    }

    getLilypond(): string {
        let s = "";
        for (let i = 0; i < this.score.timeSteps.length; i++) {
            s += this.score.timeSteps[i].getPitchs();
            s += getDurationLilypond(this.score.timeSteps[i].duration);

            if(this.score.timeSteps[i].isDot())
                s += ".";
            s += " ";
        }
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

    let possibleValues = [0.25/4, 0.25 / 2, 0.25, 0.5, 0.75, 0.25/3, 1, 0.75/2, 0.75/4];

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