import { Drawing } from "./Drawing.js";
import { Layout } from "./Layout.js";
import { Time } from "./Time.js";

export class System {

    static drawExtraLines(x: number, pitchValue: number) {
        const v = (<HTMLSelectElement>document.getElementById("clef")).value;

        let drawExtraLine = (x: number, i: number) => {
            const y = Layout.getY(i);
            const FACT = 1.8;
            Drawing.line(x - Layout.NOTERADIUS * FACT, y, x + Layout.NOTERADIUS * FACT, y);
        }

        let drawExtraLineOutside = (l: number, u: number): void => {
            for (let i = l; i >= pitchValue; i -= 2)
                drawExtraLine(x, i);
            for (let i = u; i <= pitchValue; i += 2)
                drawExtraLine(x, i);
        }

        if (v == "𝄞𝄢") {
            if (pitchValue == 0)
                drawExtraLine(x, 0);
            drawExtraLineOutside(-10, 10);
        }
        else if (v == "𝄞")
            drawExtraLineOutside(0, 10);
        else if (v == "𝄢")
            drawExtraLineOutside(-10, 0);
        else if (v == "𝄡")
            drawExtraLineOutside(-6, 6);

    }

    static drawLines() {
        const v = (<HTMLSelectElement>document.getElementById("clef")).value;
        //treble staff

        function drawFiveLinesAround(y) {
            for (let i of [y - 4, y - 2, y, y + 2, y + 4]) {
                let y = Layout.getY(i);
                Drawing.line(0, y, Layout.WIDTH, y);
            }
        }
        if (v.indexOf("𝄞") >= 0)
            drawFiveLinesAround(6);

        //bass staff
        if (v.indexOf("𝄢") >= 0)
            drawFiveLinesAround(-6);

        if (v.indexOf("𝄡") >= 0)
            drawFiveLinesAround(0);

        function getYs() {
            switch (v) {
                case "𝄞": return [2, 10];
                case "𝄢": return [-10, -2];
                case "𝄞𝄢": return [-10, 10];
                case "𝄡": return [-4, 4];
            }
        }


        //measure lines
        const measureDuration = Time.getMeasureDuration();
        const ys = getYs();
        for (let t = measureDuration; t < Layout.getT(Layout.WIDTH); t += measureDuration) {
            let x = Layout.getX(t) - 2 * Layout.NOTERADIUS;
            Drawing.line(x, Layout.getY(ys[0]), x, Layout.getY(ys[1]));
        }

    }
}