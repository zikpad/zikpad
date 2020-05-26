import { Layout } from "./Layout.js";


export class Note {
    x: number;
    pitch: number;
    private svgCircle;

    constructor(x: number, pitch: number) {
        this.x = x, this.pitch = pitch;
        this.svgCircle = newCircle(this.x, Layout.getY(this.pitch),
            Layout.getNoteRadius());
        this.svgCircle.note = this;
        this.svgCircle.addEventListener('mousedown', startDrag);
        this.svgCircle.addEventListener('mousemove', drag);
        this.svgCircle.addEventListener('mouseup', endDrag);
        this.svgCircle.addEventListener('mouseleave', endDrag);
    };

    draw() {
        document.getElementById("svg").appendChild(this.svgCircle);
    }

    update(x: number, pitch: number) {
        this.x = x, this.pitch = pitch;
        this.svgCircle.setAttribute('cx', x);
        this.svgCircle.setAttribute('cy', Layout.getY(this.pitch));
    }


    getPitchName() {
        let octave = 0;
        console.log(this.pitch)
        switch(this.pitch % 7) {
            case 0: return "c";
            case 1: return "d";
            case 2: return "e";
            case 3: return "f";
            case 4: return "g";
            case 5: return "a";
            case 6: return "b";
        }
        return "e";
    }

}



function newCircle(x, y, r) {
    var aCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    aCircle.setAttribute('cx', x);
    aCircle.setAttribute('cy', y);
    aCircle.setAttribute('r', r);
    aCircle.setAttribute('stroke', "black");
    aCircle.setAttribute('stroke-width', "1");
    return aCircle;
}



var selectedElement, offset;
function startDrag(evt) {
    console.log("startdrag")
    selectedElement = evt.target;
    offset = { x: evt.clientX, y: evt.clientY };
    offset.x -= parseFloat(selectedElement.getAttributeNS(null, "cx"));
    offset.y -= parseFloat(selectedElement.getAttributeNS(null, "cy"));

}


function drag(evt) {
    if (selectedElement) {
        evt.preventDefault();
        var coord = { x: evt.clientX, y: evt.clientY };
        selectedElement.note.update(coord.x - offset.x,
            Layout.getPitch(coord.y - offset.y));
        (<any> document.getElementById("svg")).score.update();
    }
}



function endDrag(evt) {
    selectedElement = null;
}


