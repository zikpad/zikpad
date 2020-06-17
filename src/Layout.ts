export class Layout {
    static NOTERADIUS = 16;
    static readonly WIDTH = 800;
    static HEIGHT = 700;
    static BASELINE = Layout.HEIGHT * 2 / 4;
    static RYTHMY = Layout.getY(18);
    static RYTHMYNOLET = Layout.RYTHMY - 2;
    static RYTHMX = 16;
    static RYTHMLINESSEP = 16;
    static LANDMARKHEIGHT = 32;
    static readonly XBEGINDEFAULT = 20;
    static XBEGIN = 20;

    static getNoteRadius(): number {
        return Layout.NOTERADIUS;
    }

    static getY(pitch: number) {
        return this.BASELINE - Layout.NOTERADIUS*pitch;
    }

    static getPitch(y: number) {
        return Math.round((this.BASELINE-y)/Layout.NOTERADIUS);
    }

    static getT(x: number) {
        return (x-Layout.XBEGIN)/(Layout.WIDTH - Layout.XBEGIN);
    }

    static getX(t) {
        return Layout.XBEGIN + (Layout.WIDTH - Layout.XBEGIN) * t;
    }
}