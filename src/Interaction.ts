import { Note } from "./Note.js";
import { Layout } from "./Layout.js";
import { Score } from "./Score.js";
import { Voice } from "./Voice.js";

export class InteractionScore {
    selection: Note[];
    readonly score: Score;
    readonly currentVoice: Voice;

    selectedElement: Note;
    offset;

    updateAsked = false;


    constructor(score: Score) {
        this.score = score;
        this.currentVoice = this.score.voices[0];
        score.update();
        
        this.setup();
    }


    update() {
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
            this.currentVoice.addNote(new Note(evt.x, Layout.getPitch(evt.y)));
            this.update();
        });

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


