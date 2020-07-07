export class MicrophoneInput {
    public onNote: any = undefined;
    public onSound: any = undefined;
    public onError: any = undefined;
    public onNoSound: any = undefined;

    readonly FFT_SIZE = 2048 * 2;
    readonly BUFF_SIZE = 2048 * 2;
    readonly TRESHOLDCOUNT = 2;
    readonly THRESHOLDVOLUME = 300;
    readonly THRESHOLDPEEKVOLUME = 10;
    readonly THESHOLDNBPEEKS = 30; //more peeks = noise

    currentfreq = undefined;
    fftcount = 0;

    private _started: boolean = false;

    audioInput = null;
    microphone_stream = null;
    gain_node = null;
    script_processor_node = null;
    script_processor_fft_node = null;
    analyserNode = null;
    private _isActive: boolean;

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

        } else { if (this.onError) this.onError(); }


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
                    this.findNote(spectrum);
                    this.paint(dataArray);
                }
            };


        }

        this._started = true;
        this._isActive = true;

    }


    public stop() {
        this._started = false;
        this.gain_node.disconnect();
        this._isActive = false;
    }



    public pause() {
        if (this._started) {
            this.stop();
            this._started = true;
        }
    }


    public unpause() {
        if (this._started)
            this.start();
    }



    public isActive() {
        return this._isActive;
    }

    private paint(array) {
        let canvas: HTMLCanvasElement = document.getElementById("microphoneInput") as HTMLCanvasElement;
        const WIDTH = canvas.width;
        const BASELINE = WIDTH / 2;
        let context = canvas.getContext('2d');

        context.clearRect(0, 0, WIDTH, WIDTH);
        context.beginPath();
        context.moveTo(0, BASELINE);
        for (let i = 0; i < array.length / 2; i++)
            context.lineTo(i * WIDTH / (array.length / 2), BASELINE - (array[i] - 128) * WIDTH / 2 / 128);
        context.stroke();
        let f = Math.min(this.TRESHOLDCOUNT, this.fftcount) / this.TRESHOLDCOUNT;

        if (this.fftcount >= this.TRESHOLDCOUNT - 1)
            canvas.style.backgroundColor = "yellow";
        else
            canvas.style.backgroundColor = `rgb(${255 - Math.round(255 * f)}, ${255 - Math.round(128 * f)}, ${255 - Math.round(255 * f)})`;
    }


    /**
     * This function is similar to https://github.com/performous/performous/blob/master/game/pitch.cc
     * (void Analyzer::calcTones())
     * 
     * @param spectrum 
     */
    private getMainFrequency(spectrum) {
        let SPECTRUMFACTOR = 32;

        function getSpectrumMax(spectrum: [number]) {
            let max = 0;
            for (let i = 1; i < spectrum.length / 2; i++)
                max = Math.max(max, spectrum[i]);
            return max;
        }

        function getPeeksAndClean(spectrum): Peek[] {
            let peeks = [];
            let peekseval = [];

            const max = getSpectrumMax(spectrum);

            for (let i = 1; i < spectrum.length / 2; i++) {
                if (spectrum[i - 1] <= spectrum[i] && spectrum[i] <= spectrum[i + 1] && spectrum[i] > max / 2) {
                    peeks.push(new Peek(i * SPECTRUMFACTOR));
                }
            }

            for (let i = 1; i < spectrum.length / 2; i++) {
                if (spectrum[i - 1] < spectrum[i])
                    spectrum[i - 1] = 0;
                if (spectrum[i - 1] > spectrum[i])
                    spectrum[i] = 0;
            }

            return peeks;
        }




        let peeks = getPeeksAndClean(spectrum);

        if (peeks.length == 0) {
            this.onNoSound();
            return undefined;
        }


        function findPeek(spectrum, freq) {
            let i = Math.round(freq / SPECTRUMFACTOR);
            let best = i;
            if (spectrum[i - 1] > spectrum[best]) best = i - 1;
            if (spectrum[i + 1] > spectrum[best]) best = i + 1;

            return spectrum[best];

        }


        for (let j = 0; j < peeks.length; j++) {
            let bestMark = 0;
            let bestDivFond = 1;
            for (let divFond = 2; j / divFond > 1; divFond++) {
                //test the fondamental to be peeks[j].freq / divFond
                let mark = 0;
                if (findPeek(spectrum, peeks[j].freq / divFond) != 0) {

                    for (let n = 1; n < divFond && n < 8; n++) {
                        mark += findPeek(spectrum, peeks[j].freq * n / divFond);
                    }

                }

                if (mark > bestMark) {
                    bestMark = mark;
                    bestDivFond = divFond;
                }
            }
            peeks[j].divFond = bestDivFond;
            peeks[j].mark = bestMark;
        }


        let jmax = 0;
        let max = 0;
        for (let j = 0; j < peeks.length; j++) {
            if (max < peeks[j].mark) {
                max = peeks[j].mark;
                jmax = j;
            }
        }

        let nbBigpeeks = 0;
        for (let j = 0; j < peeks.length; j++) {
            if (j != jmax) {
                if (peeks[j].mark > peeks[jmax].mark * 0.7)
                    nbBigpeeks += peeks[j].mark / peeks[jmax].mark;

            }
        }

        let frequencyFound = peeks[jmax].freqFondamental;


        document.getElementById("message").innerHTML = "" + nbBigpeeks;
        if (max <= this.THRESHOLDVOLUME || nbBigpeeks > this.THESHOLDNBPEEKS) {
            this.onNoSound();
            frequencyFound = undefined;
        }


        // document.getElementById("message").innerHTML = `force: ${max} freq: ${Math.round(freq)} count: ${this.fftcount}`;



        if (frequencyFound) {
            if (this.currentfreq && (Math.abs(this.currentfreq - frequencyFound) < 30)) {
                this.fftcount++;
                this.currentfreq = 0.5 * this.currentfreq + 0.5 * frequencyFound;
            }
            else {
                this.currentfreq = frequencyFound;
                this.fftcount = 0;
            }

            this.onSound(this.currentfreq);
        }
        else {
            this.currentfreq = undefined;
            this.fftcount = 0;
        }



        if (this.fftcount >= this.TRESHOLDCOUNT)
            return this.currentfreq
        else return undefined;
    }




    private isSingingNewNote() {
        return this.fftcount == this.TRESHOLDCOUNT;
    }

    private findNote(spectrum) {
        let freq = this.getMainFrequency(spectrum);
        if (freq == undefined || freq < 50) {
        }
        else if (this.isSingingNewNote()) {
            this.onNote(freq);
            //  this.fftcount = 0; //note has been detected, counter reset to 0
        }
    }


}


class Peek {
    public freq: number = 0;
    public divFond: number = 1;
    public mark: number;

    get freqFondamental(): number {
        return this.freq / this.divFond;
    }
    constructor(freq: number) {
        this.freq = freq;
    }
}