export class OpenFileDragDrop {

    constructor(callBackOpenFile) {
        console.log("OpenFileDragDrop");

        let myZikpad = document.getElementById("svg-wrapper");

        myZikpad.ondragover = (event) => {
            console.log('File(s) in drop zone');

            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();
        }


        myZikpad.ondrop = (event) => {
            console.log("drop!", event);
            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();

            if (event.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (var i = 0; i < event.dataTransfer.items.length; i++) {
                    // If dropped items aren't files, reject them
                    if (event.dataTransfer.items[i].kind === 'file') {
                        var file = event.dataTransfer.items[i].getAsFile();
                        callBackOpenFile(file);
                    }
                }
            } else {
                // Use DataTransfer interface to access the file(s)
                for (var i = 0; i < event.dataTransfer.files.length; i++) {
                    callBackOpenFile(file[i]);
                }
            }

        };
    }




}