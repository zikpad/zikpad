import { Voice } from './Voice.js';
import { Note } from './Note.js';
import { Command } from "./Command.js";

export class CommandAddNote implements Command {

    constructor(private voice: Voice, private note: Note) { }

    do() { this.voice.addNote(this.note); }
    undo() { this.voice.removeNote(this.note)    }

}