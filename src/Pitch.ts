export class Pitch {

    constructor(public value: number, public accidental: number) { }



    get valueM(): number {
        let x = this.value % 7;
        if (x < 0) x += 7;
        return x;
    }
    get midiPitch(): number {
        return 60 + this.nbHalfTones;
    }



    get nbHalfTones(): number {
        let f = () => {
            switch (this.valueM) {
                case 0: return 0;
                case 1: return 2;
                case 2: return 4;
                case 3: return 5;
                case 4: return 7;
                case 5: return 9;
                case 6: return 11;
            }
        }
        return 12 * Math.floor(this.value / 7) + f() + this.accidental;
    }


    get lilypondName() {

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
            switch (this.accidental) {
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


    get name() {
        return this.lilypondName.toUpperCase().replace("'", "").replace("ISIS", "x")
            .replace("ESES", "bb").replace("IS", "#").replace("ES", "b");
    }


}