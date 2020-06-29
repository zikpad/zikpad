export class Pitch {
    value: number;
    alteration: number;

    constructor(value: number, alteration) {
        this.value = value;
        this.alteration = alteration;
    }


    get midiPitch(): number {
        let f = () => {
            let x = this.value % 7;
            if (x < 0) x += 7;
            switch (x) {
                case 0: return 0;
                case 1: return 2;
                case 2: return 4;
                case 3: return 5;
                case 4: return 7;
                case 5: return 9;
                case 6: return 11;
            }
        }
        return 60 + 12 * Math.floor(this.value / 7) + f() + this.alteration;
    }


    get name() {

        let f = () => {
            let i = this.value % 7;
            if (i < 0) i += 7;
            switch (i) {
                case 0: return "c";
                case 1: return "d";
                case 2: return "e";
                case 3: return "f";
                case 4: return "g";
                case 5: return "a";
                case 6: return "b";
            }
            throw "value % 7 out of scope";
        }


        let a = () => {
            switch (this.alteration) {
                case -2: return "eses";
                case -1: return "es";
                case 0: return "";
                case 1: return "is";
                case 2: return "isis";
            }
            throw "accidental out of scope";
        }
        let octave = Math.floor(this.value / 7) + 1;
        return f() + a() + ((octave >= 0) ? "'".repeat(octave) : ",".repeat(-octave));
    }

}