import { Layout } from './Layout.js';



export class ContextualMenu {
    static toggle(selection) {

        if (document.getElementById("toggle").style.visibility == "visible") {
            ContextualMenu.hide();
        }
        else {


            let x1 = 100000;
            let y1 = 100000;
            let x2 = -1000;
            let y2 = -1000;

            for (let note of selection) {
                x1 = Math.min(note.x-Layout.NOTERADIUS, x1);
                x2 = Math.max(note.x+Layout.NOTERADIUS, x2);
                y1 = Math.min(note.y-Layout.NOTERADIUS, y1);
                y2 = Math.max(note.y+Layout.NOTERADIUS, y2);
            }


            function setPosition(btnName: string, x: number, y: number) {
                document.getElementById(btnName).style.left = (x-5).toString();
                document.getElementById(btnName).style.top = "" + y;
            }

            if (selection.size == 0) {
                document.getElementById("toggle").style.visibility = "hidden";
                document.getElementById("alterationUp").style.visibility = "hidden";
                document.getElementById("alterationDown").style.visibility = "hidden";
                document.getElementById("delete").style.visibility = "hidden";
            }
            else {
                document.getElementById("toggle").style.visibility = "visible";
                document.getElementById("delete").style.visibility = "visible";

                setPosition("toggle", x2 + 50, y1 - 50);
                setPosition("delete", x2 + 50, y1 + 50);

                if (selection.size == 1) {
                    document.getElementById("alterationUp").style.visibility = "visible";
                    document.getElementById("alterationDown").style.visibility = "visible";
                    setPosition("alterationUp", x1 - 50, y1 - 50);
                    setPosition("alterationDown", x1 - 40, y1 + 50);
                }
            }
        }
    }


    static hide() {
        document.getElementById("toggle").style.visibility = "hidden";
        document.getElementById("alterationUp").style.visibility = "hidden";
        document.getElementById("alterationDown").style.visibility = "hidden";
        document.getElementById("delete").style.visibility = "hidden";
    }
}