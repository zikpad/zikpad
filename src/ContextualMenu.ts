import { Note } from './Note.js';
import { Layout } from './Layout.js';


/**
 * Contextual Menu around notes
 */
export class ContextualMenu {
    static toggle(selection: Set<Note>) {

        if (document.getElementById("toggle").style.visibility == "visible") {
            ContextualMenu.hide();
        }
        ContextualMenu.show(selection);

    }

    static show(selection: Set<Note>) {
        let x1 = 100000;
        let y1 = 100000;
        let x2 = -1000;
        let y2 = -1000;

        for (let note of selection) {
            x1 = Math.min(note.x - Layout.NOTERADIUS, x1);
            x2 = Math.max(note.x + Layout.NOTERADIUS, x2);
            y1 = Math.min(note.y - Layout.NOTERADIUS, y1);
            y2 = Math.max(note.y + Layout.NOTERADIUS, y2);
        }

        function setPosition(btnName: string, x: number, y: number) {
            document.getElementById(btnName).style.left = (x - 10).toString();
            document.getElementById(btnName).style.top = "" + y;
        }

        if (selection.size == 0) {
            document.getElementById("toggle").style.visibility = "hidden";
            document.getElementById("accidentalUp").style.visibility = "hidden";
            document.getElementById("accidentalDown").style.visibility = "hidden";
            document.getElementById("delete").style.visibility = "hidden";
        }
        else {
            document.getElementById("toggle").style.visibility = "visible";
            document.getElementById("delete").style.visibility = "visible";

            const MENURADIUS = 40;
            setPosition("toggle", x2 + MENURADIUS, y1 - MENURADIUS);
            setPosition("delete", x2 + MENURADIUS, y1 + MENURADIUS);

            if (selection.size == 1) {
                document.getElementById("accidentalUp").style.visibility = "visible";
                document.getElementById("accidentalDown").style.visibility = "visible";
                
                setPosition("accidentalUp", x1 - Layout.NOTERADIUS - MENURADIUS, y1 - MENURADIUS);
                setPosition("accidentalDown", x1 - Layout.NOTERADIUS - MENURADIUS, y1 + MENURADIUS);
            }
        }
    }


    static hide() {
        document.getElementById("toggle").style.visibility = "hidden";
        document.getElementById("accidentalUp").style.visibility = "hidden";
        document.getElementById("accidentalDown").style.visibility = "hidden";
        document.getElementById("delete").style.visibility = "hidden";
    }
}