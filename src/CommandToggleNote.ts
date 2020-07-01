import { Command } from "./Command.js";
import { Note } from "./Note.js";

export class CommandToggleNote implements Command {

    constructor(private note: Note) { }

    do() { this.note.toggle() }
    undo() { this.note.toggle() }

}