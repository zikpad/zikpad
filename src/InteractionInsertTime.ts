import { CommandDeleteNote } from './CommandDeleteNote.js';
import { CommandUpdateNote } from './CommandUpdateNote.js';
import { CommandGroup } from './CommandGroup.js';
import { Score } from "./Score.js";
import { UndoRedo } from "./UndoRedo.js";
import { Drawing } from "./Drawing.js";
import { Layout } from "./Layout.js";
import { Command } from "./Command.js";
import { Note } from './Note.js';


/**
 * handle the tool to insert (or remove) time between notes
 */
export class InteractionInsertTime {

    private xRef: number = undefined;
    private xCurrent: number;
    private notesAfter: Note[] = [];

    constructor(private score: Score, private undoredo: UndoRedo) { }

    start(x: number) {
        this.xRef = x;
        this.xCurrent = x;
        Drawing.brisureX(x);

        for (const voice of this.score.voices)
            for (const note of voice.notes) {
                if (note.x > this.xRef)
                    this.notesAfter.push(note);
            }
    }


    move(x: number) {
        if (x > this.xRef) {
            const dx = x - this.xCurrent;
            for (let note of this.notesAfter)
                note.update(note.x + dx, note.pitch);
        }
        this.xCurrent = x;
    }



    draw() {
        Drawing.brisureX(this.xRef);
        Drawing.brisureX(this.xCurrent);

        //draw a gray rectangle that shows the portion of the score that will be deleted
        if (this.xCurrent < this.xRef) {
            const r = Drawing.rectangle(this.xCurrent, 0, this.xRef - this.xCurrent, Layout.HEIGHT);
            r.classList.add("delete");
        }

    }

    stop(): Command {

        const command = new CommandGroup();

        //insert
        if (this.xRef < this.xCurrent) {
            const dx = (this.xCurrent - this.xRef);
            //go back temporary to the initial state 
            for (let note of this.notesAfter) {
                note.update(note.x - dx, note.pitch);
                command.push(new CommandUpdateNote(note, note.x + dx, note.pitch));
            }

        }
        else {
            //delete the portions between this.x2 and this.x

            const dx = (this.xRef - this.xCurrent);
            for (let voice of this.score.voices)
                for (let note of voice.notes) {
                    if (note.x > this.xRef) {
                        command.push(new CommandUpdateNote(note, note.x - dx, note.pitch));
                    } else if (this.xCurrent < note.x && note.x < this.xRef) {
                        command.push(new CommandDeleteNote(note));
                    }
                }

        }
        this.xRef = undefined;
        return command;
    }





    get isActive() { return (this.xRef != undefined); }
}