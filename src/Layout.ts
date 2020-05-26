export class Layout {
    static NOTERADIUS = 16;

    static getNoteRadius(): number {
        return Layout.NOTERADIUS;
    }
    static getY(pitch) {
        return 200 - Layout.NOTERADIUS*pitch;
    }

    static getPitch(y) {
        return Math.round((200-y)/Layout.NOTERADIUS);
    }
}