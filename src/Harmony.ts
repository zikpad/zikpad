import { Pitch } from './Pitch.js';


export class Harmony {
    static freqToPitch(freq: number): Pitch {
        const FREQBASE = 440;
        const midiPitch = 2 + Math.round(Math.log2(Math.pow(freq * Math.pow(2, 1 / 30) / FREQBASE, 12)));
        //* Math.pow(2, 1/30) => for making the frequency higher

        return Harmony.midiPitchToPitch(midiPitch);

    }




    static midiPitchToPitch(midiPitch) {
        let octave = Math.floor(midiPitch / 12);

        let midiPitchM = midiPitch % 12;
        if (midiPitchM < 0) midiPitchM = midiPitchM + 12;

        return new Pitch(Harmony.midiPitchMTopitchM(midiPitchM) + octave * 7, Harmony.midiPitchMToAccidental(midiPitchM));

    }

    static midiPitchMTopitchM(midiPitchM) {
        switch (midiPitchM) {
            case 0: case 1: return 0;
            case 2: case 3: return 1;
            case 4: return 2;
            case 5: case 6: return 3;
            case 7: case 8: return 4;
            case 9: case 10: return 5;
            case 11: return 6;
            default: alert(midiPitchM)
        }
    }

    static midiPitchMToAccidental(midiPitchM) {
        return [1, 3, 6, 8, 10].indexOf(midiPitchM) >= 0 ? 1 : 0;
    }




    static add(pitch1: Pitch, pitch2: Pitch): Pitch {
        let result = new Pitch(pitch1.value + pitch2.value, 0);
        let nbHalfTone = result.nbHalfTones - pitch1.nbHalfTones;
        result.alteration = pitch2.nbHalfTones - nbHalfTone;
        return result;
    }


    static modulo(pitch: Pitch): Pitch {
        return new Pitch(pitch.value % 7, pitch.alteration);
    }




    static enharmonic(pitch: Pitch, key: Pitch): Pitch {
        let pitch0 = Harmony.add(pitch, new Pitch(-key.value, -key.alteration));
        let pitch0e = Harmony.midiPitchToPitch(pitch0.nbHalfTones);
        return Harmony.add(pitch0e, key);
    }


    static getAccidentals(key: Pitch) {
        let array = [];
        for (let i = 0; i < 7; i++) {
            let newPitch = Harmony.modulo(Harmony.add(new Pitch(i, 0), key));
            array[newPitch.value] = newPitch.alteration;
        }
        console.log(key)
        console.log(array)
        return array;
    }


    /**
     * @param pitch 
     * @param key 
     * @return the pitch with the accidental that is natural in the key
     * @example accidentalize(C, E) => C# because C has a # in E major
     */
    static accidentalize(pitch: Pitch, key: Pitch): Pitch {
        return new Pitch(pitch.value, Harmony.getAccidentals(key)[pitch.valueM]);
    }

}