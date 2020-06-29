import { MicrophoneInput } from "./MicrophoneInput.js";

export class InteractionRecordingMicrophone {
    private readonly microphoneInput = new MicrophoneInput();

    public onNote = undefined;
    public onSound = undefined;

    constructor() {
        this.microphoneInput.onNote = (freq) => this.onNote(freq);
        this.microphoneInput.onSound = (freq) => this.onSound(freq);

        this.microphoneInput.onError = () => {
            alert("Error with the microphone. Probably you run the page with HTTP instead of HTTPS.");
        };


        document.getElementById("recordMicrophoneButton").onclick =
            () => {
                this.microphoneInput.start();
                document.getElementById("microphoneInput").style.visibility = "visible";
                document.getElementById("recordMicrophoneButton").style.display = "none";
                document.getElementById("stopRecordMicrophoneButton").style.display = "initial";
            };


        document.getElementById("stopRecordMicrophoneButton").onclick = () => {
            this.microphoneInput.stop();
            document.getElementById("microphoneInput").style.visibility = "hidden";
            document.getElementById("recordMicrophoneButton").style.display = "initial"
            document.getElementById("stopRecordMicrophoneButton").style.display = "none";
        };

        document.getElementById("microphoneInput").style.visibility = "hidden";
        document.getElementById("stopRecordMicrophoneButton").style.display = "none"
        document.getElementById("recordMicrophoneButton").style.display = "initial"

    }



    pause(){
        this.microphoneInput.pause();
    }

    unpause(){
        this.microphoneInput.unpause();
    }
}