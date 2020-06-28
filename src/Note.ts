import { Layout } from "./Layout.js";
import { Drawing } from "./Drawing.js";


type AlterationSymbol = "" | "b" | "#" | "x" | "bb";


function alterationToSymbol(a: number) {
    switch (a) {
        case -2: return "bb";
        case -1: return "b";
        case 0: return "";
        case 1: return "#";
        case 2: return "x";
        default: return "";
    }
}


export class Note {
    get midiPitch(): number {
        let f = () => {
            let x = this.pitch % 7;
            if (x < 0) x += 7;
            switch (x) {
                case 0: return 0;
                case 1: return 2;
                case 2: return 4;
                case 3: return 5;
                case 4: return 7;
                case 5: return 9;
                case 6: return 11;
            }
        }
        return 62 + 12 * Math.floor(this.pitch / 7) + f() + this._alteration;
    }



    x: number;
    pitch: number;
    private silence: boolean = false;
    color: string = "black";
    _alteration: number = 0;

    setColor(color: string) {
        this.color = color;
        this.svgCircle.setAttribute('stroke', this.color);
    }



    get alteration() {
        return this._alteration;
    }


    set alteration(alt) {
        this._alteration = alt;
        this.svtTextAlteration.textContent = alterationToSymbol(this.alteration);
        console.log(this._alteration);
    }


    public svgCircle: SVGCircleElement;
    private svtTextAlteration: SVGTextElement;

    constructor(x: number, pitch: number) {
        this.x = x, this.pitch = pitch;
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

    update(x: number, pitch: number) {
        this.x = x, this.pitch = pitch;
        this.svgCircle.setAttribute('cx', x.toString());
        this.svgCircle.setAttribute('cy', this.y.toString());
        this.svtTextAlteration.setAttribute('x', (this.x - Layout.NOTERADIUS * 2).toString());
        this.svtTextAlteration.setAttribute('y', (this.y + Layout.NOTERADIUS / 2).toString());
    }

    get y() { return Layout.getY(this.pitch); }

    get pitchName(): string {
        if (this.isSilence())
            return "r";

        let f = () => {
            let i = this.pitch % 7;
            if (i < 0) i += 7;
            switch (i) {
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
        let octave = Math.floor(this.pitch / 7) + 1;
        return f() + ((octave >= 0) ? "'".repeat(octave) : ",".repeat(-octave));
    }
}









