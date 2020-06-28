export class MicrophoneInput {
    private _onNote: any = undefined;

    readonly FFT_SIZE = 2048 * 4;
    readonly BUFF_SIZE = 16384;

    fftcurrentmax = 0;
    fftcount = 0;

    constructor() {
        var audioContext = new AudioContext();

        console.log("audio is starting up ...");


        var audioInput = null,
            microphone_stream = null,
            gain_node = null,
            script_processor_node = null,
            script_processor_fft_node = null,
            analyserNode = null;

        (<any>navigator).getUserMedia = navigator.getUserMedia || (<any>navigator).webkitGetUserMedia || (<any>navigator).mozGetUserMedia;


        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true },
                function (stream) { startMicrophone(stream); },
                function (e) { alert('Error capturing audio.'); }
            );

        } else { throw "no getUserMedia (probably a problem of security, e.g. HTTP instead of HTTPS" }


        // ---

        let process_microphone_buffer = (event) => {

            var i, N, inp, microphone_output_buffer;

            microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now

            // microphone_output_buffer  <-- this buffer contains current gulp of data size BUFF_SIZE            
            // show_some_data(microphone_output_buffer, 5, "from getChannelData");
            //  this.paint(microphone_output_buffer);
        }

        let startMicrophone = (stream) => {

            gain_node = audioContext.createGain();
            gain_node.connect(audioContext.destination);

            microphone_stream = audioContext.createMediaStreamSource(stream);
            microphone_stream.connect(gain_node);

            script_processor_node = audioContext.createScriptProcessor(this.BUFF_SIZE, 1, 1);
            script_processor_node.onaudioprocess = process_microphone_buffer;

            microphone_stream.connect(script_processor_node);


            // --- setup FFT

            script_processor_fft_node = audioContext.createScriptProcessor(this.FFT_SIZE, 1, 1);
            script_processor_fft_node.connect(gain_node);

            analyserNode = audioContext.createAnalyser();
            analyserNode.smoothingTimeConstant = 0;
            analyserNode.fftSize = this.FFT_SIZE;

            microphone_stream.connect(analyserNode);

            analyserNode.connect(script_processor_fft_node);

            script_processor_fft_node.onaudioprocess = () => {
                // get the average for the first channel
                var array = new Uint8Array(analyserNode.frequencyBinCount);
                analyserNode.getByteFrequencyData(array);

                // draw the spectrogram
                if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {
                    this.paint(array);
                    this.findNote(array);
                }
            };


        }

    }





    private paint(array) {
        const BASELINE = 32;
        const WIDTH = 64;
        let canvas: HTMLCanvasElement = document.getElementById("microphoneInput") as HTMLCanvasElement;
        let context = canvas.getContext('2d');

        context.clearRect(0, 0, WIDTH, WIDTH);

        context.beginPath();
        context.moveTo(0, BASELINE);
        for (let i = 0; i < array.length / 2; i++) {
            context.lineTo(i * WIDTH / (array.length / 2), BASELINE - array[i]);
        }
        context.stroke();
    }



    private findNote(array) {
        if (this._onNote == undefined)
            return;
        let max = 0;
        let imax = -1;

        let peeks = [];

        for (let i = 1; i < array.length / 2; i++)
            if (array[i] > max) {
                max = array[i];
                imax = i;
            }


        const THRESHOLD = 8;
        const TRESHOLDCOUNT = 3;

        if (max > THRESHOLD && Math.abs(this.fftcurrentmax - imax) < 3)
            this.fftcount++;
        else {
            this.fftcurrentmax = imax;
            this.fftcount = 0;
        }


        if (this.fftcount >= TRESHOLDCOUNT) {
            const freq = imax * this.FFT_SIZE / array.length;
            document.getElementById("microphoneInput").classList.add("microphoneInputGood");
            this._onNote(freq);
        }
        else document.getElementById("microphoneInput").classList.remove("microphoneInputGood");
    }

    set onNote(callBack) { this._onNote = callBack; }
}