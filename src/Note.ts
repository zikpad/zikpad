import { Layout } from "./Layout.js";
import { Drawing } from "./Drawing.js";


type Alteration = "normal" | "flat" | "sharp";

export class Note {
    x: number;
    pitch: number;
    private svgCircle: SVGCircleElement;

    constructor(x: number, pitch: number) {
        this.x = x, this.pitch = pitch;
        this.svgCircle = Drawing.circle(this.x, this.y,
            Layout.getNoteRadius());
        (<any> this.svgCircle).note = this;
    };

    draw() {
        document.getElementById("svg").appendChild(this.svgCircle);
    }

    set duration(d) {
        if(d < 0.5)
            this.svgCircle.setAttribute('fill', "black");
        else
            this.svgCircle.setAttribute('fill', "white");
    }
    update(x: number, pitch: number) {
        this.x = x, this.pitch = pitch;
        this.svgCircle.setAttribute('cx', x.toString());
        this.svgCircle.setAttribute('cy', this.y.toString());
    }

    get y() {
        return  Layout.getY(this.pitch);
    }

    getPitchName() {
        let octave = 0;
        switch(this.pitch % 7) {
            case 0: return "c";
            case 1: return "d";
            case 2: return "e";
            case 3: return "f";
            case 4: return "g";
            case 5: return "a";
            case 6: return "b";
        }
        return "e";
    }

}









