import { Voice } from './Voice';
import { Score } from './Score.js';
import { VoiceSounds } from './Sound.js';

export class Player {
    onPlayingLoop = undefined;


    private score: Score;
    private stopped = false;
    private t: number;
    private sounds: VoiceSounds[] = [];

    constructor(score: Score, startingTime: number) {
        this.score = score;
        this.t = startingTime;
        for (let i in this.score.voices)
            this.sounds[i] = new VoiceSounds();

        this._loop();
    }

    _loop() {

        const WINDOW = 0.001;
        const DELAYMS = 2000 * WINDOW;
        if (this.stopped) {
            for (let i in this.score.voices)
                this.sounds[i].stop();
            return;
        };

        this.t += WINDOW;

        for (let i in this.score.voices) {
            let voice = this.score.voices[i];
            let notes = voice.getNotesBetween(this.t - WINDOW, this.t);
            if (notes.length > 0)
                this.sounds[i].stop();
            for (let note of notes)
                if (!note.isSilence() || note.domElement.classList.contains("played")) {
                    this.sounds[i].noteOn(note.pitch.midiPitch, 128);
                    note.domElement.classList.add("played");
                }

        }

        if (this.onPlayingLoop)
            this.onPlayingLoop(this.t);

        setTimeout(() => this._loop(), DELAYMS);
    }


    stop() {
        let noteElements = document.getElementsByClassName("note");

        for (let i = 0; i < noteElements.length; i++) {
            noteElements[i].classList.remove("played");
        }
        this.stopped = true;
    }



}