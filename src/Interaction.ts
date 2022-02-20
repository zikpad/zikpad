import { InteractionInsertTime } from './InteractionInsertTime.js';
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
import { InteractionPhantomNote } from './InteractionPhantomNote.js';
import { MIDIInput } from './MidiInput.js';




export class InteractionScore {

    private readonly undoRedo = new UndoRedo();
    private clipBoard: Set<{ voice: Voice, x: number, pitch: Pitch, silence: boolean }> = new Set();
    private selection: Set<Note> = new Set();

    private currentVoice: Voice;

    private draggedNote: Note;
    private offset: Map<Note, { x: number, y: number }>;
    private dragOccurred: boolean = false;
    private pasteCommand: CommandGroup = undefined;
    private x: number = 0;

    private updateAsked = false;

    private player: Player = undefined;
    dragCopyMade: boolean = false;

    private interactionSelection: InteractionSelection = undefined;
    private interactionRecordingMicrophone: InteractionRecordingMicrophone;
    private interactionInsertTime: InteractionInsertTime;
    key: Pitch = new Pitch(0, 0);


    undo() { this.undoRedo.undo(); this.update(); ContextualMenu.hide(); }
    redo() { this.undoRedo.redo(); this.update(); ContextualMenu.hide(); }
    do(command) { this.undoRedo.do(command); this.update(); ContextualMenu.hide(); }
    doKeepMenu(command) { this.undoRedo.do(command); this.update(); }

    constructor(readonly score: Score) {

        ContextualMenu.hide();

        this.interactionInsertTime = new InteractionInsertTime(this.score, this.undoRedo);
        /* this.interactionRecordingMicrophone = new InteractionRecordingMicrophone();//disabled
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
 */

        MIDIInput.onNoteOn = (midiPitch, velocity) => {
            let pitch = Harmony.midiPitchToPitch(midiPitch);
            pitch = Harmony.enharmonic(pitch, this.key);
            this.do(new CommandAddNote(this.currentVoice, new Note(this.x, pitch)));
        };

        this.currentVoice = this.score.voices[0];
        score.update();

        document.getElementById("voiceButtonPalette").innerHTML = "";
        for (let i in Voice.voiceColors) {
            let b = document.createElement("button");
            b.classList.add("voiceButton");
            b.title = "write in voice n°" + i;
            //  b.innerHTML = "voice n°" + i;
            b.style.backgroundColor = Voice.voiceColors[i];
            b.onclick = () => {
                this.currentVoice = score.voices[i];
                let command = new CommandGroup();
                for (let note of this.selection)
                    command.push(new CommandChangeVoiceNote(note, this.currentVoice));

                this.do(command);

                for (const button of document.getElementsByClassName("voiceButton"))
                    button.classList.remove("active");

                b.classList.add("active");
            }
            if (<any>i == 0)
                b.classList.add("active");

            document.getElementById("voiceButtonPalette").appendChild(b);

        }


        document.getElementById("time").onchange = () => this.askUpdate();

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
                //Harmony.enharmonic(note.pitch, this.key)
                command.push(new CommandUpdateNote(note, note.x, Harmony.accidentalize(note.pitch, this.key)));
            }
            this.do(command);
        }

        document.getElementById("playButton").onclick =
            (evt) => {
                const icon = document.getElementById("playButton").children[0];
                if (this.player == undefined) {
                    this.player = new Player(this.score, document.getElementById("container").scrollLeft / Layout.WIDTHONE);
                    this.player.onPlayingLoop = (t) => {
                        this.x = Layout.getX(t);
                    };
                    //  this.interactionRecordingMicrophone.pause();
                    icon.classList.add("fa-stop");
                    icon.classList.remove("fa-play");
                }
                else {
                    //this.interactionRecordingMicrophone.unpause();
                    this.player.stop();
                    this.player = undefined;
                    icon.classList.remove("fa-stop");
                    icon.classList.add("fa-play");
                }
            }


        document.getElementById("delete").onclick = () => { this.actionDelete(); };
        document.getElementById("toggle").onclick = () => { this.actionToggle(); };
        document.getElementById("accidentalUp").onclick = () => { this.actionAccidentalUp(); };
        document.getElementById("accidentalDown").onclick = () => { this.actionAccidentalDown(); };
        {
            const buttonScaleX = document.getElementById("scalex");
            let x = 0;
            let buttonDown = false;

            buttonScaleX.onmousemove = (evt) => {
                if (buttonDown) {
                    const delta = evt.clientX - x;
                    this.actionScaleX(delta);
                    x = evt.clientX;
                }
            };

            buttonScaleX.onmouseup = (evt) => { window.onmousemove = () => { }; buttonDown = false; };
            buttonScaleX.onmousedown = (evt) => {
                x = evt.clientX; window.onmousemove = buttonScaleX.onmousemove; window.onmouseup = buttonScaleX.onmouseup; buttonDown = true;
            };
        }

        this.setup();
    }


    actionCut() {
        this.clipBoard = createClipBoard(this.selection);
        this.actionDelete();
    }


    actionCopy() {
        this.clipBoard = createClipBoard(this.selection);
    }


    actionPaste() {
        let xmin = Infinity;
        for (const noteInfo of this.clipBoard) {
            xmin = Math.min(xmin, noteInfo.x);
        }


        this.pasteCommand = new CommandGroup();

        const x0 = document.getElementById("container").scrollLeft + 50;

        this.selection = new Set();
        for (const { voice, x, pitch, silence } of this.clipBoard) {
            const note = new Note(x - xmin + x0, pitch, silence)
            this.pasteCommand.push(new CommandAddNote(voice, note));
            this.selection.add(note);
        }
        this.do(this.pasteCommand);
        this.update();
    }


    /**delete the selection */
    actionDelete() {
        const command = new CommandGroup();
        for (const note of this.selection)
            command.push(new CommandDeleteNote(note));
        this.do(command);
        this.selection = new Set();
        this.update();
        ContextualMenu.hide();
    }



    actionDurationUniformize() {
        const command = new CommandGroup();
        const notes = Array.from(this.selection);
        notes.sort((n1: Note, n2: Note) => n1.x - n2.x);

        const x1 = notes[0].x;
        const x2 = notes[notes.length - 1].x;

        if (x2 - x1 <= 0)
            return;

        for (let i =0; i<notes.length; i++) {
            const note = notes[i];
            command.push(new CommandUpdateNote(note, x1 + i * (x2 - x1) / (notes.length-1), note.pitch));
        }
        this.doKeepMenu(command);
    }



    actionScaleX(delta) {
        const command = new CommandGroup();
        const x0 = Math.min(...Array.from(this.selection).map((note) => note.x));
        const ARF = 1000;
        const f = (ARF + delta) / ARF;
        for (const note of this.selection) {
            command.push(new CommandUpdateNote(note, x0 + (note.x - x0) * f, note.pitch));
        }
        this.doKeepMenu(command);
    }


    /**
     * toogle note <==> silence
     */
    actionToggle() {
        const command = new CommandGroup();
        for (const note of this.selection)
            command.push(new CommandToggleNote(note));
        this.doKeepMenu(command);
    }



    actionAccidentalUp() {
        let command = new CommandGroup();
        for (let note of this.selection)
            command.push(new CommandUpdateNote(note, note.x, new Pitch(note.pitch.value, Math.min(2, note.accidental + 1))));
        this.doKeepMenu(command);
    }

    actionAccidentalDown() {
        const command = new CommandGroup();
        for (const note of this.selection)
            command.push(new CommandUpdateNote(note, note.x, new Pitch(note.pitch.value, Math.max(-2, note.accidental - 1))));
        this.doKeepMenu(command);
    }



    actionMoveX(dx: number) {
        const command = new CommandGroup();
        for (const note of this.selection)
            command.push(new CommandUpdateNote(note, note.x + dx, note.pitch));
        this.doKeepMenu(command);
    }



    actionMoveY(dy: number) {
        const command = new CommandGroup();
        for (const note of this.selection)
            command.push(new CommandUpdateNote(note, note.x,
                Harmony.accidentalize(new Pitch(note.pitch.value + dy, 0), this.key)));
        this.doKeepMenu(command);
    }
    update() {
        this.score.update();
        this.setup();
        this.updateAsked = false;
    }

    setup() {
        const circles = document.getElementsByClassName("note");
        for (let i = 0; i < circles.length; i++) {
            const circle = <HTMLElement>circles[i];
            circle.classList.remove("selection");
            circle.onmousedown = (evt) => this.startDrag(evt);
            circle.onmousemove = (evt) => this.drag(evt);
            circle.onmouseup = (evt) => this.endDrag(evt);
        }

        if (this.selection.size >= 1)
            for (const note of this.selection) {
                note.domElement.classList.add("selection");
                this.x = note.x;
            }

        document.onkeydown = (evt) => {
            if (evt.keyCode == KeyEvent.DOM_VK_DELETE)
                this.actionDelete();


            if (evt.keyCode == KeyEvent.DOM_VK_SPACE)
                this.actionToggle();


            if (evt.keyCode == KeyEvent.DOM_VK_LEFT)
                this.actionMoveX(-10);
            if (evt.keyCode == KeyEvent.DOM_VK_RIGHT)
                this.actionMoveX(10);

            if (evt.keyCode == KeyEvent.DOM_VK_UP)
                this.actionMoveY(1);
            if (evt.keyCode == KeyEvent.DOM_VK_DOWN)
                this.actionMoveY(-1);

            if (evt.ctrlKey && evt.keyCode == KeyEvent.DOM_VK_X)
                this.actionCut();

            if (evt.ctrlKey && evt.keyCode == KeyEvent.DOM_VK_C)
                this.actionCopy();

            if (evt.ctrlKey && evt.keyCode == KeyEvent.DOM_VK_V)
                this.actionPaste();

            if (evt.key == "u") {
                this.actionDurationUniformize();
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

        if (evt.shiftKey) {
            this.interactionInsertTime.start(Layout.clientToXY(evt).x);
        }
        else {
            if (this.interactionSelection == undefined)
                this.interactionSelection = new InteractionSelection(this.score, evt);

            this.x = Layout.clientToXY(evt).x;
        }



    }


    startDrag(evt: MouseEvent) {
        this.dragOccurred = false;
        this.dragCopyMade = false;
        this.draggedNote = (<any>evt.target).note;
        this.pasteCommand = undefined;

        if (this.draggedNote && !this.dragOccurred && (!this.selection.has(this.draggedNote))) {
            if (evt.ctrlKey)
                this.selection = this.selection.add(this.draggedNote);
            else
                this.selection = new Set([this.draggedNote]);
        }


        ContextualMenu.toggle(this.selection);

        this.offset = this.getOffset(evt, this.selection);

    }



    getOffset(evt, selection: Set<Note>) {
        const r = new Map();
        for (const note of selection) {
            const p = Layout.clientToXY(evt);
            p.x -= parseFloat(note.domElement.getAttributeNS(null, "cx"));
            p.y -= parseFloat(note.domElement.getAttributeNS(null, "cy"));
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
        InteractionPhantomNote.move(evt.x, evt.y, this.currentVoice);

        this.dragOccurred = true;

        if (this.interactionInsertTime.isActive) {
            this.interactionInsertTime.move(Layout.clientToXY(evt).x);
            this.update();
            this.interactionInsertTime.draw();
        }
        else if (this.interactionSelection) {
            this.interactionSelection.mouseMove(evt);
            ContextualMenu.hide();
        }

        else if (this.draggedNote) {
            evt.preventDefault();
            let coord = Layout.clientToXY(evt);

            const dxshiftScreen = 32;
            if (evt.clientX < 100 && Layout.xLeftScreen > dxshiftScreen) {
                Layout.xLeftScreen -= dxshiftScreen;
                for (const note of this.offset.keys()) {
                    this.offset.get(note).x += dxshiftScreen;
                }
            }


            if (evt.clientX > window.innerWidth - 100) {
                Layout.xLeftScreen += dxshiftScreen;
                for (const note of this.offset.keys()) {
                    this.offset.get(note).x -= dxshiftScreen;
                }
            }


            if (this.pasteCommand == undefined) {

                if (evt.ctrlKey) {
                    this.pasteCommand = new CommandGroup();
                    const newSelection = [];
                    for (const note of this.selection) {
                        const newNote = new Note(note.x, note.pitch, note.isSilence());
                        newSelection.push(newNote);
                        this.pasteCommand.push(new CommandAddNote(note.voice, newNote));
                    }
                    this.selection = new Set(newSelection);
                    this.offset = this.getOffset(evt, this.selection);
                    this.dragCopyMade = true;

                    for (let note of this.selection) {
                        let dx = coord.x - this.offset.get(note).x;
                        let dy = coord.y - this.offset.get(note).y;
                        this.pasteCommand.push(
                            new CommandUpdateNote(note, dx, Harmony.accidentalize(
                                new Pitch(Layout.getPitchValue(dy), 0), this.key)));
                    }
                }
                else {
                    this.pasteCommand = new CommandGroup();
                    for (let note of this.selection) {
                        let dx = coord.x - this.offset.get(note).x;
                        let dy = coord.y - this.offset.get(note).y;
                        this.pasteCommand.push(new CommandUpdateNote(note, dx,
                            Harmony.accidentalize(new Pitch(Layout.getPitchValue(dy), 0), this.key)));
                    }
                }

                this.do(this.pasteCommand);
            }



            let i = 0;
            for (let note of this.selection) {
                let dx = coord.x - this.offset.get(note).x;
                let dy = coord.y - this.offset.get(note).y;

                let command = (this.pasteCommand.size == this.selection.size) ?
                    this.pasteCommand.get(i) :
                    this.pasteCommand.get(this.selection.size + i);

                let pitch = Harmony.accidentalize(new Pitch(Layout.getPitchValue(dy), 0), this.key);
                note.update(dx, pitch);
                (command as CommandUpdateNote).update(dx, pitch);
                i++;
            }

            ContextualMenu.show(this.selection);
            this.askUpdate();
        }
    }


    endDrag(evt) {

        const updateAfterEndDrag = () => {

        }
        if (this.interactionInsertTime.isActive) {
            this.do(this.interactionInsertTime.stop());
        }
        //selection rectangle
        else if (this.interactionSelection && this.interactionSelection.isActive()) {
            if (evt.ctrlKey) {
                for (let note of this.interactionSelection.getSelection())
                    this.selection.add(note);
            }
            else
                this.selection = new Set(this.interactionSelection.getSelection());
            ContextualMenu.show(this.selection);
            this.interactionSelection = undefined;
            document.getElementById("svg").style.cursor = "default";
        }
        //click outside a note
        else if (!this.draggedNote &&
            (!this.interactionSelection || !this.interactionSelection.isActive())) {
            if (this.selection.size > 0)
                this.selection = new Set();
            else if (this.interactionRecordingMicrophone == undefined || !this.interactionRecordingMicrophone.isActive()) {
                let p = Layout.clientToXY(evt);
                let note = new Note(p.x + Layout.xLeftScreen,
                    Harmony.accidentalize(new Pitch(Layout.getPitchValue(p.y + Layout.yLeftScreen), 0), this.key));
                this.do(new CommandAddNote(this.currentVoice, note));
            }
            document.getElementById("svg").style.cursor = "crosshair";
            ContextualMenu.hide();
        }
        else //after clicking on a note
        {
            document.getElementById("svg").style.cursor = "default";

        }



        this.interactionSelection = null;
        this.draggedNote = null;
        this.update();
    }


}




function createClipBoard(selection: Set<Note>): Set<{ voice: Voice, x: number, pitch: Pitch, silence: boolean }> {
    const newSelection = [];
    for (const note of selection) {
        newSelection.push({ voice: note.voice, x: note.x, pitch: note.pitch, silence: note.isSilence() });
    }
    return new Set(newSelection);
}
