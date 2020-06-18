import { Note } from "./Note.js";
import { Layout } from "./Layout.js";
import { Score } from "./Score.js";
import { Voice } from "./Voice.js";

export class InteractionScore {
    selection: Note[];
    readonly score: Score;
    currentVoice: Voice;

    selectedElement: Note;
    offset;
    dragOccurred: boolean = false;

    updateAsked = false;


    constructor(score: Score) {
        this.score = score;
        this.currentVoice = this.score.voices[0];
        score.update();

        for(let i in Voice.voiceColors) {
            let b = document.createElement("button");
            b.classList.add("voiceButton");
            b.style.backgroundColor = Voice.voiceColors[i];
            b.addEventListener("click", () => this.currentVoice = score.voices[i])
            document.getElementById("voiceButtonPalette").appendChild(b);

        }
        
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
            this.currentVoice.addNote(new Note(evt.clientX + document.getElementById("svg-wrapper").scrollLeft, Layout.getPitch(evt.y)));
            this.update();
        });

    }






    startDrag(evt) {
        this.dragOccurred = false;
        this.selectedElement = evt.target.note;
        if (this.selectedElement == null)
            throw "error"
        this.offset = { x: evt.clientX, y: evt.clientY };
        this.offset.x -= parseFloat(evt.target.getAttributeNS(null, "cx"));
        this.offset.y -= parseFloat(evt.target.getAttributeNS(null, "cy"));

    }


    askUpdate() {
        if (!this.updateAsked) {
            this.updateAsked = true;
            setTimeout(() => this.update(), 500);
        }
    }

    drag(evt) {
        this.dragOccurred = true;
        if (this.selectedElement) {
            evt.preventDefault();
            var coord = { x: evt.clientX, y: evt.clientY };
            this.selectedElement.update(coord.x - this.offset.x,
                Layout.getPitch(coord.y - this.offset.y));
            this.askUpdate();
        }
    }


    endDrag(evt) {
        if (!this.dragOccurred)
            this.selectedElement.toggle();
        if (this.selectedElement != null)
            this.update();

        this.selectedElement = null;
    }


}


