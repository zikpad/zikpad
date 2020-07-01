import { Note } from './Note.js';
import { Pitch } from './Pitch.js';

export class CommandUpdateNote {

    private previousX;
    private previousPitch;

    constructor(private note: Note, private x: number, private pitch: Pitch) {
        this.previousX = note.x;
        this.previousPitch = note.pitch;
     }


     update(x, pitch) {
         this.x = x;
         this.pitch = pitch;
     }

     
     do() { this.note.update(this.x, this.pitch); }
     undo() { this.note.update(this.previousX, this.previousPitch);  }
}