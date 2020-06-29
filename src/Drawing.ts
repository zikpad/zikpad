export class Drawing {
    static text(x: number, y: number, s: string) {
        let aText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        aText.setAttribute("x", ""+x);
        aText.setAttribute("y", ""+y);
        aText.innerHTML = s;
        aText.setAttribute('stroke', "black");
        aText.setAttribute('fill', "black");
        aText.setAttribute('stroke-width', "1");
        document.getElementById("svg").appendChild(aText);
        return aText;
    }
    static circle(x, y, r) {
        let aCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        aCircle.setAttribute('cx', x);
        aCircle.setAttribute('cy', y);
        aCircle.setAttribute('r', r);
        aCircle.setAttribute('stroke', "black");
        aCircle.setAttribute('stroke-width', "1");
        document.getElementById("svg").appendChild(aCircle);
        return aCircle;
    }


    static lineLight(x1, y1, x2, y2) {
        var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        aLine.setAttribute('x1', x1);
        aLine.setAttribute('y1', y1);
        aLine.setAttribute('x2', x2);
        aLine.setAttribute('y2', y2);
        aLine.setAttribute('stroke', "lightgray");
        aLine.setAttribute('stroke-width', "1");
        aLine.addEventListener("mousedown", (evt) => evt.preventDefault());
        document.getElementById("svg").appendChild(aLine);
        return aLine;
    }
    
    static line(x1, y1, x2, y2) {
        var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        aLine.setAttribute('x1', x1);
        aLine.setAttribute('y1', y1);
        aLine.setAttribute('x2', x2);
        aLine.setAttribute('y2', y2);
        aLine.setAttribute('stroke', "black");
        aLine.addEventListener("mousedown", (evt) => evt.preventDefault());
        aLine.setAttribute('stroke-width', "3");
        document.getElementById("svg").appendChild(aLine);
        return aLine;
    }

    static lineRythm(x1, y1, x2, y2) {
        var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        aLine.setAttribute('x1', x1);
        aLine.setAttribute('y1', y1);
        aLine.setAttribute('x2', x2);
        aLine.setAttribute('y2', y2);
        aLine.setAttribute('stroke', "black");
        aLine.setAttribute('stroke-width', "8");
        document.getElementById("svg").appendChild(aLine);
        return aLine;
    }

    static rectangle(x1, y1, width, height) {
        var aRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        aRect.setAttribute('x', x1);
        aRect.setAttribute('y', y1);
        aRect.setAttribute('width', width);
        aRect.setAttribute('height', height);
        aRect.setAttribute('stroke', "black");
        aRect.setAttribute('stroke-width', "8");
        document.getElementById("svg").appendChild(aRect);
        return aRect;
    }
}