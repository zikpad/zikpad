export class Layout {
    static NOTERADIUS = 12;
    static WIDTH = 800;
    static HEIGHT = 400;
    static BASELINE = Layout.HEIGHT * 3 / 4;
    static RYTHMY = Layout.getY(18);
    static RYTHMLINESSEP = 8;

    static getNoteRadius(): number {
        return Layout.NOTERADIUS;
    }
    static getY(pitch) {
        return this.BASELINE - Layout.NOTERADIUS*pitch;
    }

    static getPitch(y) {
        return Math.round((this.BASELINE-y)/Layout.NOTERADIUS);
    }
}