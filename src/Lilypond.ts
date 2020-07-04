import { Pitch } from './Pitch.js';
import { Score } from "./Score.js";
import { Note } from "./Note.js";
import { Voice } from "./Voice.js";

export class Lilypond {



    private static lilypondPitchNameToValue(s: string): number {
        switch (s) {
            case "c": return 0;
            case "d": return 1;
            case "e": return 2;
            case "f": return 3;
            case "g": return 4;
            case "a": return 5;
            case "b": return 6;
            default: throw "error";
        }
    }



    private static lilyAccidentalToNumber(s: string): number {
        if (s.startsWith("isis")) return 2;
        if (s.startsWith("eses")) return -2;
        if (s.startsWith("is")) return 1;
        if (s.startsWith("es")) return -1;
        return 0;
    }

    private static lilyOctaveShiftToNumber(s: string): number {
        if (s.length == 0)
            return -7;
        else if (s[0] == "'")
            return  - 7 + 7 * s.length;
        else if (s[0] == ",")
            return  - 7 - 7 * s.length;

        throw "lilyOctaveShiftToNumber: I do not understand " + s;
    }

    static lilyPitchToPitch(s: string): Pitch {
        s = s.trim();
        let v = Lilypond.lilypondPitchNameToValue(s[0]);
        s = s.substr(1);
        let a = Lilypond.lilyAccidentalToNumber(s);

        s = s.substr(Math.abs(a * 2));
        return new Pitch(v + this.lilyOctaveShiftToNumber(s), a);
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


    private static getDurationBasisLilypond(duration) {
        if (duration >= 1) return "1";
        if (duration >= 0.5) return "2";
        if (duration >= 0.25) return "4";
        if (duration >= 0.25 / 2) return "8";
        return "16";
    }

    private static getCodeVoice(voice: Voice): string {
        let s = "";
        let i = 0;
        while (i < voice.timeSteps.length) {
            if (voice.isTrioletStartingFrom(i)) {
                s += `\\tuplet 3/2 { ${voice.timeSteps[i].getPitchs()}8 ${voice.timeSteps[i + 1].getPitchs()} ${voice.timeSteps[i + 2].getPitchs()}} `;
                i += 3;
            }
            else {
                s += voice.timeSteps[i].getPitchs();
                s += Lilypond.getDurationBasisLilypond(voice.timeSteps[i].duration);

                if (voice.timeSteps[i].isDot())
                    s += ".";
                s += " ";
                i++;

            }
        }

        return s;
    }



    static getVoiceName(i: string) { return "voice" + String.fromCharCode(65 + parseInt(i)); }

    static getCode(score: Score) {
        const lines = [];
        for (const i in score.voices)
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

    private static getVoiceClef(voice: Voice): string {
        if (voice.notes.length == 0) return "";

        let s = 0;
        for (let note of voice.notes) {
            s += note.pitch.value;
        }
        if (s >= 0)
            return "";
        else return " \\clef bass";
    }
}




function test() {
    if (Lilypond.lilyPitchToPitch("e").value != 2 - 7) alert("aïe");
    if (Lilypond.lilyPitchToPitch("e ").value != 2 - 7) alert("aïe");
    if (Lilypond.lilyPitchToPitch("e'").value != 2) alert("aïe");
    if (Lilypond.lilyPitchToPitch("e''").value != 2 + 7) alert("aïe");

    if (Lilypond.lilyPitchToPitch("eis''").value != 2 + 7) alert("aïe value wrong");
    if (Lilypond.lilyPitchToPitch("eis''").accidental != 1) alert("aïe accidental wrong");
}


test();