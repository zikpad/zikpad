import { Pitch } from './Pitch.js';


export class Layout {
    static readonly NOTERADIUS = 16;
    static readonly WIDTHONE = 800;
    static WIDTH = 20000;
    static readonly HEIGHT = 800;
    static readonly BASELINE = Layout.HEIGHT * 2 / 4;
    static readonly RYTHMY = -4 * Layout.NOTERADIUS;
    static readonly RYTHMYNOLET = Layout.RYTHMY - 2;
    static readonly RYTHMX = 16;
    static readonly RYTHMLINESSEP = 16;
    static readonly LANDMARKHEIGHT = 800;
    private static readonly XBEGINDEFAULT = 64;

    static getY(pitch: number | Pitch) {
        let v: number;
        if (pitch instanceof Pitch)
            v = pitch.value;
        else
            v = pitch;

        return this.BASELINE - Layout.NOTERADIUS * v;
    }

    static getPitchValue(y: number): number {
        return Math.round((this.BASELINE - y) / Layout.NOTERADIUS);
    }

    static getT(x: number) {
        return (x - Layout.XBEGINDEFAULT) / (Layout.WIDTHONE - Layout.XBEGINDEFAULT);
    }

    static getX(t) {
        return Layout.XBEGINDEFAULT + (Layout.WIDTHONE - Layout.XBEGINDEFAULT) * t;
    }
}