import { CommandToggleNote } from './CommandToggleNote.js';
import { CommandUpdateNote } from './CommandUpdateNote.js';
import { CommandAddNote } from './CommandAddNote.js';
import { UndoRedo } from './UndoRedo.js';
import { InteractionRecordingMicrophone } from './InteractionRecordingMicrophone.js';
import { Harmony } from './Harmony.js';
import { ContextualMenu } from './ContextualMenu.js';
import { Player } from './Player.js';
import { Note } from "./Note.js";
import { Layout } from "./Layout.js";
import { Score } from "./Score.js";
import { Voice } from "./Voice.js";
import { KeyEvent } from "./KeyEvent.js";
import { InteractionSelection } from './InteractionSelection.js';
import { Pitch } from './Pitch.js';
import { CommandGroup } from './CommandGroup.js';
import { CommandChangeVoiceNote } from './CommandChangeVoiceNote.js';
import { CommandDeleteNote } from './CommandDeleteNote.js';




export class InteractionScore {

    private undoRedo = new UndoRedo();
    private selection: Set<Note> = new Set();
    readonly score: Score;
    private currentVoice: Voice;

    private draggedNote: Note;
    private offset: Map<Note, { x: number, y: number }>;
    private dragOccurred: boolean = false;
    private dragCommand: CommandGroup = undefined;

    private updateAsked = false;

    private player: Player = undefined;
    dragCopyMade: boolean = false;

    private interactionSelection: InteractionSelection = undefined;
    private interactionRecordingMicrophone: InteractionRecordingMicrophone;
    key: Pitch = new Pitch(0, 0);


    undo() { this.undoRedo.undo(); this.update(); ContextualMenu.hide(); }
    redo() { this.undoRedo.redo(); this.update(); ContextualMenu.hide(); }
    do(command) { this.undoRedo.do(command); this.update(); ContextualMenu.hide(); }

    constructor(score: Score) {

        ContextualMenu.hide();

        this.interactionRecordingMicrophone = new InteractionRecordingMicrophone();

        this.interactionRecordingMicrophone.x = Layout.getX(0);


        this.interactionRecordingMicrophone.onNoSound = (freq) => {
            document.getElementById("microphoneInput").style.top = "" + (Layout.getY(new Pitch(20, 0)) - Layout.NOTERADIUS + 2);
        }

        this.interactionRecordingMicrophone.onSound = (freq) => {
            let pitch = Harmony.freqToPitch(freq);
            document.getElementById("microphoneInput").style.top = "" + (Layout.getY(pitch) - Layout.NOTERADIUS + 2);
        }
        this.interactionRecordingMicrophone.onNote = (freq) => {

            //document.getElementById("microphoneInputFreq").innerHTML = freq;
            let pitch = Harmony.freqToPitch(freq);
            pitch = Harmony.enharmonic(pitch, this.key);
            if (this.selection.size == 0) {
                if (!this.currentVoice.contains(this.interactionRecordingMicrophone.x, pitch))
                    this.do(new CommandAddNote(this.currentVoice, new Note(this.interactionRecordingMicrophone.x, pitch)));
            }

            else if (this.selection.size == 1)
                for (let note of this.selection)
                    this.do(new CommandUpdateNote(note, note.x, pitch));

            this.update();

        };


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
                let command = new CommandGroup();
                for (let note of this.selection) {
                    command.commands.push(new CommandChangeVoiceNote(note, this.currentVoice));
                }
                this.do(command);
            }
            document.getElementById("voiceButtonPalette").appendChild(b);

        }




        const keysSelect = document.getElementById("keys") as HTMLSelectElement;
        keysSelect.innerHTML = "";
        
        let pitchs = [];
        let pitch = new Pitch(0, -1);
        let quinte = new Pitch(4, 0);

        for (let i = -7; i <= 7; i++) {
            let option = document.createElement("option");

            option.classList.add("keyButton");
            option.value = i.toString();
            pitchs[i] = pitch;
            // b.title = "switch in key " + pitch.name + " major";
            option.innerHTML = pitch.name + " major";

            if (i == 0)
                option.selected = true;

            const currentPitch = Harmony.modulo(Harmony.add(pitch, quinte));

            keysSelect.appendChild(option);
            pitch = currentPitch;
        }


        keysSelect.onchange = () => {
            this.key = pitchs[parseInt(keysSelect.options[keysSelect.selectedIndex].value)];

            let command = new CommandGroup();
            for (let note of this.selection) {
                command.commands.push(new CommandUpdateNote(note, note.x, Harmony.enharmonic(note.pitch, this.key)));
            }
            this.do(command);
        }

        document.getElementById("playButton").onclick =
            (evt) => {
                const icon = document.getElementById("playButton").children[0];
                if (this.player == undefined) {
                    this.player = new Player(this.score, document.getElementById("svg-wrapper").scrollLeft / Layout.WIDTHONE);
                    this.interactionRecordingMicrophone.pause();
                    icon.classList.add("fa-stop");
                    icon.classList.remove("fa-play");
                }
                else {
                    this.interactionRecordingMicrophone.unpause();
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
        let command = new CommandGroup();
        for (let note of this.selection)
            command.commands.push(new CommandDeleteNote(note));
        this.do(command);
        this.selection = new Set();
        this.update();
        ContextualMenu.hide();
    }


    actionToggle() {
        let command = new CommandGroup();
        for (let note of this.selection)
            command.commands.push(new CommandToggleNote(note));
        this.do(command);
    }



    actionAlterationUp() {
        let command = new CommandGroup();
        for (let note of this.selection)
            command.commands.push(new CommandUpdateNote(note, note.x, new Pitch(note.pitch.value, Math.min(2, note.alteration + 1))));
        this.do(command);
    }

    actionAlterationDown() {
        let command = new CommandGroup();
        for (let note of this.selection)
            command.commands.push(new CommandUpdateNote(note, note.x, new Pitch(note.pitch.value, Math.max(-2, note.alteration - 1))));
        this.do(command);
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
            for (let note of this.selection) {
                note.svgCircle.classList.add("selection");
                this.interactionRecordingMicrophone.x = note.x;
            }


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

        this.interactionRecordingMicrophone.x = evt.clientX;

    }


    startDrag(evt: MouseEvent) {
        this.dragOccurred = false;
        this.dragCopyMade = false;
        this.draggedNote = (<any>evt.target).note;
        this.dragCommand = undefined;

        if (this.draggedNote && !this.dragOccurred && (!this.selection.has(this.draggedNote))) {
            if (evt.ctrlKey)
                this.selection = this.selection.add(this.draggedNote);
            else
                this.selection = new Set([this.draggedNote]);
        }


        ContextualMenu.toggle(this.selection);

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


        if (this.interactionSelection) {
            this.interactionSelection.mouseMove(evt);
            ContextualMenu.hide();
        }

        else if (this.draggedNote) {
            evt.preventDefault();
            let coord = { x: evt.clientX, y: evt.clientY };

            if (this.dragCommand == undefined) {

                if (evt.ctrlKey) {
                    this.dragCommand = new CommandGroup();
                    let newSelection = [];
                    for (let note of this.selection) {
                        let newNote = new Note(note.x, note.pitch);
                        newSelection.push(newNote);
                        this.dragCommand.commands.push(new CommandAddNote(note.voice, newNote));
                    }
                    this.selection = new Set(newSelection);
                    this.offset = this.getOffset(evt, this.selection);
                    this.dragCopyMade = true;

                    for (let note of this.selection) {
                        let dx = coord.x - this.offset.get(note).x;
                        let dy = coord.y - this.offset.get(note).y;
                        this.dragCommand.commands.push(new CommandUpdateNote(note, dx, new Pitch(Layout.getPitchValue(dy), 0)));
                    }
                }
                else {
                    this.dragCommand = new CommandGroup();
                    for (let note of this.selection) {
                        let dx = coord.x - this.offset.get(note).x;
                        let dy = coord.y - this.offset.get(note).y;
                        this.dragCommand.commands.push(new CommandUpdateNote(note, dx, new Pitch(Layout.getPitchValue(dy), 0)));
                    }
                }

                this.do(this.dragCommand);
            }



            let i = 0;
            for (let note of this.selection) {
                let dx = coord.x - this.offset.get(note).x;
                let dy = coord.y - this.offset.get(note).y;


                let command = (this.dragCommand.commands.length == this.selection.size) ?
                    this.dragCommand.commands[i] :
                    this.dragCommand.commands[this.selection.size + i];

                note.update(dx, new Pitch(Layout.getPitchValue(dy), 0));
                (command as CommandUpdateNote).update(dx, new Pitch(Layout.getPitchValue(dy), 0));
                i++;
            }



            ContextualMenu.hide();
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
            ContextualMenu.show(this.selection);
            this.interactionSelection = undefined;
        }
        //click outside a note
        else if (!this.draggedNote &&
            (!this.interactionSelection || !this.interactionSelection.isActive())) {
            if (this.selection.size > 0)
                this.selection = new Set();
            else if (!this.interactionRecordingMicrophone.isActive()) {
                let note = new Note(evt.clientX + document.getElementById("svg-wrapper").scrollLeft,
                    Harmony.accidentalize(new Pitch(Layout.getPitchValue(evt.y), 0), this.key));
                this.do(new CommandAddNote(this.currentVoice, note));
            }
            ContextualMenu.hide();
        }


        this.interactionSelection = null;
        this.draggedNote = null;
        this.update();
    }


}


