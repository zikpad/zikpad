
let context = new window.AudioContext();

let url = "";



class Timbre {
    private readonly soundbuffers: any[number] = new Array();

    addWaveBuffer(frequency, name) {
        let timbre = this;
        let getSound = new XMLHttpRequest();
        console.log("starting creating XMLHttpRequest for file " + name);
        getSound.open("GET", url + name, true);
        getSound.responseType = "arraybuffer";
        getSound.onload = function () {
            context.decodeAudioData(getSound.response, function (buffer) {
                console.log("starting receiving buffer of file " + name);
                timbre.soundbuffers[frequency] = buffer;
                console.log("file for " + name + " loaded");
            });
        }
        getSound.send();
    }




    getBestBufferAndBestFrequency(frequency) {
        let b = Number.MAX_VALUE;
        let freqBest;
        for (let freq in this.soundbuffers) {
            if (b > Math.abs(parseInt(freq) - frequency)) {
                freqBest = freq;
                b = Math.abs(parseInt(freq) - frequency);
            }
        }
        return { buffer: this.soundbuffers[freqBest], frequency: freqBest };
    }


    getAudio(context, frequency) {
        let o = this.getBestBufferAndBestFrequency(frequency);

        let audio = context.createBufferSource();
        audio.buffer = o.buffer;
        audio.playbackRate.value = frequency / o.frequency;

        return audio;
    }



}




let timbrePiano = getTimbrePiano();
//let timbreClarinet = getTimbreClarinet();

let getTimbre = (midiNote, velocity) => timbrePiano;



/**load piano sounds*/
function getTimbrePiano() {
    let timbre = new Timbre();
    timbre.addWaveBuffer(110, "sounds/Piano.mf.A1.ogg");
    timbre.addWaveBuffer(220, "sounds/Piano.mf.A2.ogg");
    timbre.addWaveBuffer(440, "sounds/Piano.mf.A3.ogg");
    timbre.addWaveBuffer(880, "sounds/Piano.mf.A4.ogg");
    return timbre;
}



function getTimbreClarinet() {
    let timbre = new Timbre();
    timbre.addWaveBuffer(440, "sounds/BbClarinet.ff.A3.ogg");
    timbre.addWaveBuffer(880, "sounds/BbClarinet.ff.A4.ogg");
    timbre.addWaveBuffer(880 * 2, "sounds/BbClarinet.ff.A5.ogg");
    timbre.addWaveBuffer(880 * 4, "sounds/BbClarinet.ff.A6.ogg");
    return timbre;

}



function getFrequencyTempered(midiNote, velocity) {
    const numero = (midiNote - (60));
    return 440 * Math.pow(2, 3 / 12) * Math.pow(2, numero / 12);
}


export class VoiceSounds {

    private readonly audios = {};

    noteOn(midiNote: number, velocity: number) {
        const frequency = getFrequencyTempered(midiNote, velocity);
        //velocity = getVelocity(midiNote, velocity);
        const timbre = getTimbre(midiNote, velocity);
        const audio = timbre.getAudio(context, frequency);

        const gainNode = context.createGain();
        gainNode.gain.value = velocity / 64;
        audio.connect(gainNode);
        gainNode.connect(context.destination);

        audio.start(0);
        this.audios[midiNote] = audio;
    }



    stop() {
        for (let midiNote in this.audios)
            this.stopAudios(midiNote);
    }


    stopAudios(midiNote) {
        if (this.audios[midiNote] != undefined)
            this.audios[midiNote].stop(context.currentTime);
    }


}


