export class MicrophoneInput {
    private _onNote: any = undefined;

    readonly FFT_SIZE = 2048;
    readonly BUFF_SIZE = 2048;

    fftcurrentmax = 0;
    fftcount = 0;
    private _onError: any;

    private _started: boolean = false;

    audioInput = null;
    microphone_stream = null;
    gain_node = null;
    script_processor_node = null;
    script_processor_fft_node = null;
    analyserNode = null;

    constructor() {
    }


    start() {
        
        var audioContext: AudioContext = new AudioContext();

        console.log("audio is starting up ...");




        (<any>navigator).getUserMedia = navigator.getUserMedia || (<any>navigator).webkitGetUserMedia || (<any>navigator).mozGetUserMedia;


        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true },
                function (stream) { startMicrophone(stream); },
                function (e) { alert('Error capturing audio.'); }
            );

        } else { if(this.onError) this.onError(); }


        let startMicrophone = (stream) => {

            this.gain_node = audioContext.createGain();
            this.gain_node.gain.value = 0; //volume off to avoid Larsen effect
            this.gain_node.connect(audioContext.destination);

            this.microphone_stream = audioContext.createMediaStreamSource(stream);
            this.microphone_stream.connect(this.gain_node);

            /*   script_processor_node = audioContext.createScriptProcessor(this.BUFF_SIZE, 1, 1);
               script_processor_node.onaudioprocess = process_microphone_buffer;
   
               microphone_stream.connect(script_processor_node);*/


            // --- setup FFT

            this.script_processor_fft_node = audioContext.createScriptProcessor(this.FFT_SIZE, 1, 1);
            this.script_processor_fft_node.connect(this.gain_node);

            this.analyserNode = audioContext.createAnalyser();
            this.analyserNode.smoothingTimeConstant = 0;
            this.analyserNode.fftSize = this.FFT_SIZE;

            this.microphone_stream.connect(this.analyserNode);

            this.analyserNode.connect(this.script_processor_fft_node);

            this.script_processor_fft_node.onaudioprocess = () => {
                // get the average for the first channel
                var spectrum = new Uint8Array(this.analyserNode.frequencyBinCount);
                this.analyserNode.getByteFrequencyData(spectrum);

                var dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
                this.analyserNode.getByteTimeDomainData(dataArray);

                // draw the spectrogram
                if (this.microphone_stream.playbackState == this.microphone_stream.PLAYING_STATE) {
                    this.paint(dataArray);
                    this.findNote(spectrum);
                }
            };


        }

        this._started = true;

    }


    public stop() {
        this._started = false;
        this.gain_node.disconnect();
    }



    public pause() {
        if(this._started) {
           this.stop();
           this._started = true;
        }
    }


    public unpause() {
        if(this._started)
            this.start();
    }


    private paint(array) {
        const BASELINE = 32;
        const WIDTH = 64;
        let canvas: HTMLCanvasElement = document.getElementById("microphoneInput") as HTMLCanvasElement;
        let context = canvas.getContext('2d');

        context.clearRect(0, 0, WIDTH, WIDTH);
        context.beginPath();
        context.moveTo(0, BASELINE);
        for (let i = 0; i < array.length / 2; i++)
            context.lineTo(i * WIDTH / (array.length / 2), BASELINE - (array[i] - 128) * WIDTH / 2 / 128);
        context.stroke();
    }



    private getMainFrequency(spectrum) {
        if (this._onNote == undefined)
            return undefined;
        let max = 0;
        let imax = -1;

        const THRESHOLD = 32;
        const NBPEEKSMAX = 30;

        let peeks = [];
        let peekseval = [];

        for (let i = 1; i < spectrum.length / 8; i++) {
            if (spectrum[i - 1] <= spectrum[i] && spectrum[i] <= spectrum[i + 1] && spectrum[i] > THRESHOLD)
                peeks.push(i);
        }

        if (peeks.length > NBPEEKSMAX)
            return undefined;

        for (let j = 0; j < peeks.length; j++) {
            peekseval[j] = spectrum[peeks[j]] + spectrum[2 * peeks[j]] + spectrum[3 * peeks[j]] + spectrum[4 * peeks[j]];
        }

        let jmax = 0;
        for (let j = 0; j < peeks.length; j++) {
            if (max < peekseval[j]) {
                max = peekseval[j];
                jmax = j;
            }
        }

        imax = peeks[jmax];

        const TRESHOLDCOUNT = 1;

        if (max > THRESHOLD && Math.abs(this.fftcurrentmax - imax) < 3)
            this.fftcount++;
        else {
            this.fftcurrentmax = imax;
            this.fftcount = 0;
        }


        if (this.fftcount >= TRESHOLDCOUNT)
            return imax * 8;//this.BUFF_SIZE / this.FFT_SIZE;
        else return undefined;
    }



    private findNote(spectrum) {
        let freq = this.getMainFrequency(spectrum);
        if (freq == undefined || freq < 50)
            document.getElementById("microphoneInput").classList.remove("microphoneInputGood");
        else {
            document.getElementById("microphoneInput").classList.add("microphoneInputGood");
            this._onNote(freq);
        }
    }

    set onNote(callBack) { this._onNote = callBack; }

    set onError(callBack) { this._onError = callBack; }
}