import { Voice } from './Voice.js';
import { Note } from './Note.js';


export class CommandChangeVoiceNote {

    private previousVoice;


    constructor(private note: Note, private voice: Voice) {
        this.previousVoice = note.voice;
    }

    do() {
        this.previousVoice.removeNote(this.note);
        this.voice.addNote(this.note);
    }

    undo() {
        this.voice.removeNote(this.note);
        this.previousVoice.addNote(this.note);
    }
}