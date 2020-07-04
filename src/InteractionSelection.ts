import { Drawing } from './Drawing.js';
import { Score } from './Score.js';
import { Note } from './Note.js';

/**
 * handle the selection
 */
export class InteractionSelection {

    private readonly score: Score;
    private readonly evtBegin: MouseEvent;
    private svgRectangle: SVGRectElement = undefined;

    private x: number;
    private y: number;
    private width: number;
    private height: number;

    constructor(score: Score, evt: MouseEvent) {
        this.score = score;
        this.evtBegin = evt;
        this.svgRectangle = undefined;

    }


    mouseMove(evt: MouseEvent) {
        const THRESHOLD = 4;

        //if there is no rectangle but the mouse moved enough then setup a rectangle
        if ((this.svgRectangle == undefined) &&
            ((Math.abs(evt.clientX - this.evtBegin.clientX) > THRESHOLD) || (Math.abs(evt.clientY - this.evtBegin.clientY) > THRESHOLD))) {
            this.svgRectangle = Drawing.rectangle(0, 0, 0, 0);
            this.svgRectangle.classList.add("selectionRectangle");
        }


        if (this.svgRectangle) {
            let x1 = Math.min(this.evtBegin.clientX, evt.clientX) + 1 * document.getElementById("svg-wrapper").scrollLeft;
            let y1 = Math.min(this.evtBegin.clientY, evt.clientY);
            let x2 = Math.max(this.evtBegin.clientX, evt.clientX) + 1 * document.getElementById("svg-wrapper").scrollLeft;
            let y2 = Math.max(this.evtBegin.clientY, evt.clientY);

            this.x = x1;
            this.y = y1;
            this.width = (x2 - x1);
            this.height = (y2 - y1);
            this.svgRectangle.setAttribute("x", "" + x1);
            this.svgRectangle.setAttribute("y", "" + this.y);
            this.svgRectangle.setAttribute("width", "" + this.width);
            this.svgRectangle.setAttribute("height", "" + this.height);
        }
    }


    /**
     * @returns true iff the selection tool is active (i.e. there is a rectangle)
     */
    isActive() { return (this.svgRectangle != undefined); }

    /**
     * @returns the notes in the rectangle if there is one
     */
    getSelection(): Note[] {
        if (this.svgRectangle) {
            let s = [];
            for (let voice of this.score.voices)
                for (let note of voice.notes) {
                    if (this.x <= note.x && note.x <= this.x + this.width &&
                        this.y <= note.y && note.y <= this.y + this.height)
                        s.push(note);
                }
            console.log(s.length)

            if (document.getElementById("svg").contains(this.svgRectangle))
                document.getElementById("svg").removeChild(this.svgRectangle);
            return s;
        }
        else
            return [];
    }
}