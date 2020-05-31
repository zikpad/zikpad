export class Drawing {
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
        aLine.setAttribute('stroke-width', "2");
        document.getElementById("svg").appendChild(aLine);
        return aLine;
    }

    static lineThick(x1, y1, x2, y2) {
        var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        aLine.setAttribute('x1', x1);
        aLine.setAttribute('y1', y1);
        aLine.setAttribute('x2', x2);
        aLine.setAttribute('y2', y2);
        aLine.setAttribute('stroke', "black");
        aLine.setAttribute('stroke-width', "5");
        document.getElementById("svg").appendChild(aLine);
        return aLine;
    }
}