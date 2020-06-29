import { Pitch } from './Pitch.js';


export class Harmony {
    static freqToPitch(freq:number): Pitch {
        const FREQBASE = 440;
        const midiPitch = 2+Math.round(Math.log2(Math.pow(freq * Math.pow(2, 1/30) / FREQBASE, 12)  ));
        //* Math.pow(2, 1/30) => for making the frequency higher

        let octave = Math.floor(midiPitch / 12);

        let midiPitchM = midiPitch % 12;
        if(midiPitchM < 0) midiPitchM = midiPitchM + 12;

        return new Pitch(Harmony.midiPitchMTopitchM(midiPitchM) + octave * 7, Harmony.midiPitchMToAccidental(midiPitchM));

        
    }


    static midiPitchMTopitchM(midiPitchM) {
        switch(midiPitchM) {
            case 0: case 1: return 0;
            case 2: case 3: return 1;
            case 4: return 2;
            case 5: case 6: return 3;
            case 7: case 8: return 4;
            case 9: case 10: return 5;
            case 11: return 6;
            default:  alert(midiPitchM)
        }
    }

    static midiPitchMToAccidental(midiPitchM) {
        return [1, 3, 6, 8, 10].indexOf(midiPitchM) >= 0 ? 1 : 0;
    }

}