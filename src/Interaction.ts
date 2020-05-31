import { Note } from "./Note.js";
import { Layout } from "./Layout.js";
import { Score } from "./Score.js";

export class InteractionScore {
    selection: Note[];
    score: Score;

    selectedElement: Note;
    offset;

    updateAsked = false;


    constructor(score) {
        this.score = score;
        score.update();
        this.setup();
    }


    update() {
        console.log("update" + this.score.notes.length)
        this.score.update();
        this.setup();
        this.updateAsked = false;
    }

    setup() {
        let circles = document.getElementsByTagName("circle");

        for (let i = 0; i < circles.length; i++) {
            let circle = circles[i];
            circle.addEventListener('mousedown', (evt) => this.startDrag(evt));
            circle.addEventListener('mousemove', (evt) => this.drag(evt));
            circle.addEventListener('mouseup', (evt) => this.endDrag(evt));
        }

        document.getElementById("svgBackground").addEventListener('mousemove', (evt) => this.drag(evt));
        document.getElementById("svgBackground").addEventListener('mouseup', (evt) => this.endDrag(evt));

        document.getElementById("svgBackground").addEventListener("click", (evt) => {
            console.log("click")
            this.score.addNote(new Note(evt.x, Layout.getPitch(evt.y)));
            this.update();
        });

        (<any>document.getElementById("svg")).score = this;
    }






    startDrag(evt) {
        this.selectedElement = evt.target.note;
        if (this.selectedElement == null)
            throw "error"
        this.offset = { x: evt.clientX, y: evt.clientY };
        this.offset.x -= parseFloat(evt.target.getAttributeNS(null, "cx"));
        this.offset.y -= parseFloat(evt.target.getAttributeNS(null, "cy"));

    }


    drag(evt) {
        if (this.selectedElement) {
            evt.preventDefault();
            var coord = { x: evt.clientX, y: evt.clientY };
            this.selectedElement.update(coord.x - this.offset.x,
                Layout.getPitch(coord.y - this.offset.y));
            
            if(!this.updateAsked) {
                this.updateAsked = true;
                setTimeout(() => this.update(), 500);
            }
                
        }
    }


    endDrag(evt) {
        if (this.selectedElement != null)
            this.update();
        this.selectedElement = null;
    }
}


