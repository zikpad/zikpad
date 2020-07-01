import { Voice } from './Voice';
import { Pitch } from './Pitch.js';
import { Layout } from "./Layout.js";
import { Drawing } from "./Drawing.js";


type AlterationSymbol = "" | "b" | "#" | "x" | "bb";


function alterationToSymbol(a: number): AlterationSymbol {
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
    _alteration: number = 0;

    setColor(color: string) {
        this.color = color;
        this.svgCircle.setAttribute('stroke', this.color);
    }

    setVoice(voice) {
        this.voice = voice;
    }

    get alteration() {
        return this.pitch.alteration;
    }


    set alteration(alt) {
        this.pitch.alteration = alt;
        this.svtTextAlteration.textContent = alterationToSymbol(this.alteration);

    }



    public svgCircle: SVGCircleElement;
    private svtTextAlteration: SVGTextElement;

    constructor(public x: number, public pitch: Pitch) {
        this.svgCircle = Drawing.circle(this.x, this.y, Layout.NOTERADIUS);
        this.svtTextAlteration = Drawing.text(this.x - Layout.NOTERADIUS * 2, this.y + Layout.NOTERADIUS / 2, alterationToSymbol(this.alteration));

        (<any>this.svgCircle).note = this;
    };

    draw() {
        document.getElementById("svg").appendChild(this.svgCircle);
        document.getElementById("svg").appendChild(this.svtTextAlteration);
    }

    /**
     * toggle Silence <-> Not Silence (Real note)
     */
    toggle() {
        this.silence = !this.silence;
        this.svtTextAlteration.style.visibility = this.silence ? "hidden" : "visible";


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
        this.svtTextAlteration.setAttribute('x', (this.x - Layout.NOTERADIUS * 2).toString());
        this.svtTextAlteration.setAttribute('y', (this.y + Layout.NOTERADIUS / 2).toString());
        this.svtTextAlteration.textContent = alterationToSymbol(this.alteration);
    }

    get y() { return Layout.getY(this.pitch); }

    get pitchName(): string {
        if (this.isSilence())
            return "r";
        else
            return this.pitch.lilypondName;


    }
}









