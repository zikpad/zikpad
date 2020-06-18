export class Layout {
    static NOTERADIUS = 16;
    static readonly WIDTHONE = 800;
    static WIDTH = 20000;
    static HEIGHT = 800;
    static BASELINE = Layout.HEIGHT * 2 / 4;
    static RYTHMY = -4 * Layout.NOTERADIUS;
    static RYTHMYNOLET = Layout.RYTHMY - 2;
    static RYTHMX = 16;
    static RYTHMLINESSEP = 16;
    static LANDMARKHEIGHT = 800;
    private static readonly XBEGINDEFAULT = 64;

    static getNoteRadius(): number {
        return Layout.NOTERADIUS;
    }

    static getY(pitch: number) {
        return this.BASELINE - Layout.NOTERADIUS * pitch;
    }

    static getPitch(y: number) {
        return Math.round((this.BASELINE - y) / Layout.NOTERADIUS);
    }

    static getT(x: number) {
        return (x - Layout.XBEGINDEFAULT) / (Layout.WIDTHONE - Layout.XBEGINDEFAULT);
    }

    static getX(t) {
        return Layout.XBEGINDEFAULT + (Layout.WIDTHONE - Layout.XBEGINDEFAULT) * t;
    }
}