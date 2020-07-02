import { CommandDeleteNote } from './CommandDeleteNote.js';
import { CommandUpdateNote } from './CommandUpdateNote.js';
import { CommandGroup } from './CommandGroup.js';
import { Score } from "./Score.js";
import { UndoRedo } from "./UndoRedo.js";
import { Drawing } from "./Drawing.js";
import { Layout } from "./Layout.js";
import { Command } from "./Command.js";
import { Note } from './Note.js';

export class InteractionInsertTime {

    private x: number = undefined;
    private x2: number;
    private notes: Note[] = [];

    constructor(private score: Score, private undoredo: UndoRedo) { }

    start(x: number) {
        this.x = x;
        this.x2 = x;
        Drawing.brisureX(x);

        for (let voice of this.score.voices)
            for (let note of voice.notes) {
                if (note.x > x)
                    this.notes.push(note);
            }
    }


    move(x: number) {
        if (x > this.x) {
            const dx = x - this.x2;
            for (let note of this.notes)
                note.update(note.x + dx, note.pitch);
        }
        this.x2 = x;
    }



    draw() {
        Drawing.brisureX(this.x);
        Drawing.brisureX(this.x2);
        if (this.x2 < this.x) {
            const r = Drawing.rectangle(this.x2, 0, this.x - this.x2, Layout.HEIGHT);
            r.classList.add("delete");
        }

    }

    stop(): Command {

        const command = new CommandGroup();

        //insert
        if (this.x < this.x2) {
            const dx = (this.x2 - this.x);
            //go back temporary to the initial state 
            for (let note of this.notes) {
                note.update(note.x - dx, note.pitch);
                command.commands.push(new CommandUpdateNote(note, note.x + dx, note.pitch));
            }

        }
        else {
            //delete the portions between this.x2 and this.x
            
            const dx = (this.x - this.x2);
            for (let voice of this.score.voices)
                for (let note of voice.notes) {
                    if (note.x > this.x) {
                        command.commands.push(new CommandUpdateNote(note, note.x - dx, note.pitch));
                    } else if (this.x2 < note.x && note.x < this.x) {
                        command.commands.push(new CommandDeleteNote(note));
                    }
                }

        }
        this.x = undefined;
        return command;
    }





    get isActive() {
        return (this.x != undefined);
    }
}