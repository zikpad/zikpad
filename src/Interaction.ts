import { ContextualMenu } from './ContextualMenu.js';
import { Player } from './Player.js';
import { Note } from "./Note.js";
import { Layout } from "./Layout.js";
import { Score } from "./Score.js";
import { Voice } from "./Voice.js";
import { KeyEvent } from "./KeyEvent.js";
import { InteractionSelection } from './InteractionSelection.js';



export class InteractionScore {

    private selection: Set<Note> = new Set();
    readonly score: Score;
    private currentVoice: Voice;

    private draggedNote: Note;
    private offset: Map<Note, { x: number, y: number }>;
    private dragOccurred: boolean = false;

    private updateAsked = false;

    private player: Player = undefined;
    dragCopyMade: boolean = false;
    private interactionSelection: InteractionSelection = undefined;


    constructor(score: Score) {
        this.score = score;
        this.currentVoice = this.score.voices[0];
        score.update();

        document.getElementById("voiceButtonPalette").innerHTML = "";
        for (let i in Voice.voiceColors) {
            let b = document.createElement("button");
            b.classList.add("voiceButton");
            b.title = "write in voice n°" + i;
            b.innerHTML = "voice n°" + i;
            b.style.backgroundColor = Voice.voiceColors[i];
            b.onclick = () => {
                this.currentVoice = score.voices[i];
                for (let note of this.selection) {
                    score.removeNote(note);
                    this.currentVoice.addNote(note);
                }
                this.update();
            }
            document.getElementById("voiceButtonPalette").appendChild(b);

        }

        document.getElementById("playButton").onclick =
            (evt) => {
                const icon = document.getElementById("playButton").children[0];
                if (this.player == undefined) {
                    this.player = new Player(this.score, document.getElementById("svg-wrapper").scrollLeft / Layout.WIDTHONE);
                    icon.classList.add("fa-stop");
                    icon.classList.remove("fa-play");
                }
                else {
                    this.player.stop();
                    this.player = undefined;
                    icon.classList.remove("fa-stop");
                    icon.classList.add("fa-play");
                }
            }


        document.getElementById("delete").onclick = () => { this.actionDelete(); };
        document.getElementById("toggle").onclick = () => { this.actionToggle(); };
        document.getElementById("alterationUp").onclick = () => { this.actionAlterationUp(); };
        document.getElementById("alterationDown").onclick = () => { this.actionAlterationDown(); };

        this.setup();
    }




    

    actionDelete() {
        for (let note of this.selection)
            this.score.removeNote(note);
        this.selection = new Set();
        this.update();
        ContextualMenu.hide();
    }


    actionToggle() {
        for (let note of this.selection)
            note.toggle();
        this.update();
    }



    actionAlterationUp() {
        for (let note of this.selection)
            note.alteration = Math.min(2, note.alteration+1);
            
        this.update();
    }

    actionAlterationDown() {
        for (let note of this.selection)
            note.alteration = Math.max(-2, note.alteration-1);
        this.update();
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
            circle.classList.remove("selection");
            circle.onmousedown = (evt) => this.startDrag(evt);
            circle.onmousemove = (evt) => this.drag(evt);
            circle.onmouseup = (evt) => this.endDrag(evt);
        }

        if (this.selection.size >= 1)
            for (let note of this.selection)
                note.svgCircle.classList.add("selection");

        document.onkeydown = (evt) => {
            if (evt.keyCode == KeyEvent.DOM_VK_DELETE) {
                this.actionDelete();
            }
        };

        document.getElementById("svgBackground").onmousedown = (evt) => this.mouseDownBackground(evt);
        document.getElementById("svgBackground").onmousemove = (evt) => this.drag(evt);
        document.getElementById("svgBackground").onmouseup = (evt) => this.endDrag(evt);

        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('touchforcechange', (e) => e.preventDefault(), { passive: false });
        document.getElementById("svgBackground").addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        document.getElementById("svgBackground").addEventListener('touchforcechange', (e) => e.preventDefault(), { passive: false });
    }




    mouseDownBackground(evt: MouseEvent) {
        ContextualMenu.hide();
        if (this.interactionSelection == undefined)
            this.interactionSelection = new InteractionSelection(this.score, evt);
    }


    startDrag(evt: MouseEvent) {
        this.dragOccurred = false;
        this.dragCopyMade = false;
        this.draggedNote = (<any>evt.target).note;

        ContextualMenu.toggle(this.selection);
        if (this.draggedNote && !this.dragOccurred && (!this.selection.has(this.draggedNote))) {
            if (evt.ctrlKey)
                this.selection = this.selection.add(this.draggedNote);
            else
                this.selection = new Set([this.draggedNote]);
        }

        this.offset = this.getOffset(evt, this.selection);

    }



    getOffset(evt, selection) {
        let r = new Map();
        for (let note of selection) {
            let p = { x: evt.clientX, y: evt.clientY };
            p.x -= parseFloat(note.svgCircle.getAttributeNS(null, "cx"));
            p.y -= parseFloat(note.svgCircle.getAttributeNS(null, "cy"));
            r.set(note, p);
        }
        return r;

    }

    askUpdate() {
        if (!this.updateAsked) {
            this.updateAsked = true;
            setTimeout(() => this.update(), 500);
        }
    }

    drag(evt: MouseEvent) {
        this.dragOccurred = true;

        if (this.interactionSelection)
            this.interactionSelection.mouseMove(evt);
        else if (this.draggedNote) {
            evt.preventDefault();
            let coord = { x: evt.clientX, y: evt.clientY };

            if (evt.ctrlKey && !this.dragCopyMade) {
                let newSelection = [];
                for (let note of this.selection) {
                    let newNote = new Note(note.x, note.pitch);
                    newSelection.push(newNote);
                    this.currentVoice.addNote(newNote);
                }
                this.selection = new Set(newSelection);
                this.offset = this.getOffset(evt, this.selection);
                this.dragCopyMade = true;
            }


            for (let note of this.selection) {
                let dx = coord.x - this.offset.get(note).x;
                let dy = coord.y - this.offset.get(note).y;
                note.update(dx, Layout.getPitch(dy));
            }


            this.askUpdate();
        }
    }


    endDrag(evt) {
        //selection rectangle
        if (this.interactionSelection && this.interactionSelection.isActive()) {
            if (evt.ctrlKey) {
                for (let note of this.interactionSelection.getSelection())
                    this.selection.add(note);
            }
            else
                this.selection = new Set(this.interactionSelection.getSelection());
            this.interactionSelection = undefined;
        }
        //click outside a note
        else if (!this.draggedNote &&
            (!this.interactionSelection || !this.interactionSelection.isActive())) {
            if (this.selection.size > 0)
                this.selection = new Set();
            else {
                let note = new Note(evt.clientX + document.getElementById("svg-wrapper").scrollLeft,
                    Layout.getPitch(evt.y));
                this.currentVoice.addNote(note);
            }
        }


        this.interactionSelection = null;
        this.draggedNote = null;
        this.update();
    }


}


