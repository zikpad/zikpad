import { Command } from "./Command.js";
import { Note } from "./Note.js";

export class CommandDeleteNote implements Command {

    constructor(private note: Note) { }

    do() { this.note.voice.removeNote(this.note); }
    undo() { this.note.voice.addNote(this.note)    }

}