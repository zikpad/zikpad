export class Layout {
    static NOTERADIUS = 8;
    static WIDTH = 800;
    static HEIGHT = 200;
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