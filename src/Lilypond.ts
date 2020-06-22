import { Score } from "./Score.js";
import { Note } from "./Note.js";
import { Voice } from "./Voice.js";

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
            return r - 7 + 7 * (s.length - 1);
        else if (s[1] == ",")
            return r - 7 - 7 * (s.length - 1);

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


    static getDurationLilypond(duration) {
        if (duration >= 1) return "1";
        if (duration >= 0.5) return "2";
        if (duration >= 0.25) return "4";
        if (duration >= 0.25 / 2) return "8";
        return "16";
    }

    static getCodeVoice(voice: Voice): string {
        let s = "";
        let i = 0;
        while (i < voice.timeSteps.length) {
            if (voice.isTrioletStartingFrom(i)) {
                s += `\\tuplet 3/2 { ${voice.timeSteps[i].getPitchs()}8 ${voice.timeSteps[i + 1].getPitchs()} ${voice.timeSteps[i + 2].getPitchs()}} `;
                i += 3;
            }
            else {
                s += voice.timeSteps[i].getPitchs();
                s += Lilypond.getDurationLilypond(voice.timeSteps[i].duration);

                if (voice.timeSteps[i].isDot())
                    s += ".";
                s += " ";
                i++;

            }
        }



        /* s += " ";
         for (let timestep of this.score.timeSteps) {
             s += `${timestep._duration} `;
         }*/

        return s;
    }



    static getVoiceName(i: string) {
        let j = parseInt(i);
        //alert(j)
        //alert(String.fromCharCode(65+j))
        return "voice" + String.fromCharCode(65 + j);
    }

    static getCode(score: Score) {
        let lines = [];
        for (let i in score.voices)
            if (!score.voices[i].isEmpty()) {
                lines.push(`%ZIKPAD voice ${i}`);
                for (let note of score.voices[i].notes) {
                    if (note.isSilence())
                        lines.push(`%ZIKPAD ${note.x} ${note.pitchName} silence`)
                    else
                        lines.push(`%ZIKPAD ${note.x} ${note.pitchName}`)
                }
            }


        lines.push('\\version "2.19.83"');

        lines.push("global = { \n             \\key c \\major \n           \\time 4/4 \n          }");
        lines.push('');



        for (let i in score.voices) if (!score.voices[i].isEmpty()) {
            lines.push(`${Lilypond.getVoiceName(i)} = {`);
            lines.push('\\global');
            lines.push('\\dynamicUp');

            lines.push(this.getCodeVoice(score.voices[i]));
            lines.push('}');
        }

        lines.push('');
        for (let i in score.voices) if (!score.voices[i].isEmpty()) {
            lines.push(`${Lilypond.getVoiceName(i)}Part = \\new Staff \\with {`);
            lines.push(`instrumentName = "${Lilypond.getVoiceName(i)}"`);
            lines.push('midiInstrument = "choir aahs"');
            lines.push(`} { ${Lilypond.getVoiceClef(score.voices[i])} \\${Lilypond.getVoiceName(i)} }`);
        }

        lines.push('');
        lines.push(`\\score {`);
        lines.push('<<');

        for (let i in score.voices) if (!score.voices[i].isEmpty()) {
            lines.push(`\\${Lilypond.getVoiceName(i)}Part`);
        }
        lines.push('>>');
        lines.push('\\layout { }')
        lines.push('\\midi {');
        lines.push('\\tempo 4=100');
        lines.push('}');
        lines.push('}');


        return lines.join("\n");
    }
    static getVoiceClef(voice: Voice): string {
        if (voice.notes.length == 0) return "";

        let s = 0;
        for (let note of voice.notes) {
            s += note.pitch;
        }
        if (s >= 0)
            return "";
        else return " \\clef bass";
    }
}




function test() {
    if (Lilypond.lilyPitchToPitch("e") != 2 - 7) alert("aïe");
    if (Lilypond.lilyPitchToPitch("e ") != 2 - 7) alert("aïe");
    if (Lilypond.lilyPitchToPitch("e'") != 2) alert("aïe");
    if (Lilypond.lilyPitchToPitch("e''") != 2 + 7) alert("aïe");
}


test();