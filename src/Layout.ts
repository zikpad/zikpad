import { Pitch } from './Pitch.js';


export class Layout {
    static readonly NOTERADIUS = 18;
    static readonly NOTERADIUSX = 18;
    static readonly WIDTHONE = 800;
    static readonly WIDTH = 20000;
    static readonly HEIGHT = 800;
    static readonly BASELINE = Layout.HEIGHT * 2 / 4;
    static readonly RYTHMY = -4 * Layout.NOTERADIUS;
    static readonly RYTHMYNOLET = Layout.RYTHMY - 2;
    static readonly RYTHMX = 16;
    static readonly RYTHMLINESSEP = 16;
    static readonly LANDMARKHEIGHT = 800;
    private static readonly XBEGINDEFAULT = 64;

    private static _zoom = 1.0;

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
        return Math.max(0, (x - Layout.XBEGINDEFAULT) / (Layout.WIDTHONE - Layout.XBEGINDEFAULT));
    }

    static getX(t) {
        return Layout.XBEGINDEFAULT + (Layout.WIDTHONE - Layout.XBEGINDEFAULT) * t;
    }


    static clientToXY(evt: MouseEvent): { x: number, y: number } {
        return { x: evt.clientX / Layout._zoom, y: evt.clientY / Layout._zoom };
    }


    static get zoom() {
        return Layout._zoom;
    }

    static set zoom(z) {
        Layout._zoom = z;
        document.getElementById("content").style.transform = `scale(${z})`;
    }


    static get xLeftScreen() {
        return document.getElementById("container").scrollLeft / Layout._zoom;
    }

    static get yLeftScreen() {
        return document.getElementById("container").scrollTop / Layout._zoom;
    }


    static set xLeftScreen(x: number) {
        document.getElementById("container").scrollLeft = x * Layout._zoom;
    }

    static adaptZoom() {
        Layout.zoom = Math.min(2, document.getElementById("container").clientHeight / 800);
    }
}