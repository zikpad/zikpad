import { Score } from "./Score.js";
import { Note } from "./Note.js";

export class Lilypond {

    static lilyPitchToPitch(s: string): number {
        s = s.trim();
        let r = 0;
        switch (s[0]) {
            case "c": r = 0; break;
            case "d": r = 1; break;
            case "e": r = 2; break;
            case "f": r = 3; break;
            case "g": r = 4; break;
            case "a": r = 5; break;
            case "b": r = 6;
        }
        if (s.length == 1)
            return r - 7;
        else if (s[1] == "'")
            return r - 7 + 7 * (s.length-1);
        else if (s[1] == ",")
            return r - 7 - 7 * (s.length-1);

        alert("aïe")
        return -1000;
    }

    static getScore(score: Score, lilypond: string) {
        let iVoice = 0;
        let lines = lilypond.split("\n");
        for (let line of lines) {
            if (line.startsWith("%ZIKPAD")) {
                let el = line.split(" ");
                if (el[1] == "voice") {
                    iVoice = parseInt(el[2]);
                } else {
                    let x = parseInt(el[1]);
                    let note = new Note(x, Lilypond.lilyPitchToPitch(el[2]));
                    if (el[3] != undefined)
                        note.toggle();
                    score.voices[iVoice].addNote(note);
                }

            }
        }
        score.update();
    }


    static getCode(score: Score) {
        let lines = [];
        for (let i in score.voices) {
            lines.push("%ZIKPAD voice " + i);
            for (let note of score.voices[i].notes) {
                if (note.isSilence())
                    lines.push(`%ZIKPAD ${note.x} ${note.pitchName} silence`)
                else
                    lines.push(`%ZIKPAD ${note.x} ${note.pitchName}`)
            }
        }
        return lines.join("\n");
    }
}




function test() {
    if(Lilypond.lilyPitchToPitch("e") != 2-7) alert("aïe");
    if(Lilypond.lilyPitchToPitch("e ") != 2-7) alert("aïe");
    if(Lilypond.lilyPitchToPitch("e'") != 2) alert("aïe");
    if(Lilypond.lilyPitchToPitch("e''") != 2+7) alert("aïe");
}


test();