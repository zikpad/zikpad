import { Voice } from './Voice';
import { Pitch } from './Pitch.js';
import { Layout } from "./Layout.js";
import { Drawing } from "./Drawing.js";


type AccidentalSymbol = "" | "b" | "#" | "x" | "bb";


function accidentalToSymbol(a: number): AccidentalSymbol {
    switch (a) {
        case -2: return "bb";
        case -1: return "b";
        case 0: return "";
        case 1: return "#";
        case 2: return "x";
        default: throw `error ${a} is a wrong accidental`;
    }
}


export class Note {
    private silence: boolean = false;
    public voice: Voice;

    color: string = "black";

    setColor(color: string) {
        this.color = color;
        this.svgCircle.setAttribute('stroke', this.color);
    }

    setVoice(voice) {
        this.voice = voice;
    }

    get accidental() {
        return this.pitch.accidental;
    }


    set accidental(accidental) {
        this.pitch.accidental = accidental;
        this.svtTextAccidental.textContent = accidentalToSymbol(this.accidental);

    }



    public svgCircle: SVGCircleElement;
    private svtTextAccidental: SVGTextElement;

    constructor(public x: number, public pitch: Pitch) {
        this.svgCircle = Drawing.circle(this.x, this.y, Layout.NOTERADIUS);
        this.svtTextAccidental = Drawing.text(this.x - Layout.NOTERADIUS * 2, this.y + Layout.NOTERADIUS / 2, accidentalToSymbol(this.accidental));

        (<any>this.svgCircle).note = this;
    };

    draw() {
        document.getElementById("svg").appendChild(this.svgCircle);
        document.getElementById("svg").appendChild(this.svtTextAccidental);
    }

    /**
     * toggle Silence <-> Not Silence (Real note)
     */
    toggle() {
        this.silence = !this.silence;
        this.svtTextAccidental.style.visibility = this.silence ? "hidden" : "visible";


        if (this.svgCircle.classList.contains("silence"))
            this.svgCircle.classList.remove("silence");
        else
            this.svgCircle.classList.add("silence")
    }

    isSilence(): boolean {
        return this.silence;
    }

    set duration(d) {
        if (this.isSilence()) {
            this.svgCircle.setAttribute('fill', this.color);
        }
        else {
            if (d < 0.5) {
                this.svgCircle.setAttribute('stroke', "black");
                this.svgCircle.setAttribute('fill', this.color);
            }
            else {
                this.svgCircle.setAttribute('fill', "white");
                this.svgCircle.setAttribute('stroke', this.color);
            }
        }
    }

    update(x: number, pitch: Pitch) {
        this.x = x, this.pitch = pitch;
        this.svgCircle.setAttribute('cx', x.toString());
        this.svgCircle.setAttribute('cy', this.y.toString());
        this.svtTextAccidental.setAttribute('x', (this.x - Layout.NOTERADIUS * 2).toString());
        this.svtTextAccidental.setAttribute('y', (this.y + Layout.NOTERADIUS / 2).toString());
        this.svtTextAccidental.textContent = accidentalToSymbol(this.accidental);
    }

    get y() { return Layout.getY(this.pitch); }
    get t() { return Layout.getT(this.x); }

    get pitchName(): string { return (this.isSilence()) ? "r" : this.pitch.lilypondName; }
}









