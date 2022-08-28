export class MIDIInput {
	static init() {
		// request MIDI access
		console.log("try to find a MIDI input device...")
		if ((<any> navigator).requestMIDIAccess) {
			(<any> navigator).requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
		}
		else {
			console.log("No MIDI support in your browser.");
		}
	}

	static onNoteOn: (note: number, velocity: number) => void = (note, velocity) => {return};
	static onNoteOff: (note: number, velocity: number) => void = (note, velocity) => {return};

}



let midi;

// midi functions
function onMIDISuccess(midiAccess) {
	midi = midiAccess;
	const inputs = midi.inputs.values();
	// loop through all inputs
	for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
		// listen for midi messages
		input.value.onmidimessage = onMIDIMessage;
		consolelogMIDIInputs(input);
	}
	// listen for connect/disconnect message
	midi.onstatechange = onStateChange;
}

function onMIDIMessage(event) {
	const data = event.data;
	const cmd = data[0] >> 4,
		channel = data[0] & 0xf,
		type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
		note = data[1],
		velocity = data[2];
	// with pressure and tilt off
	// note off: 128, cmd: 8 
	// note on: 144, cmd: 9
	// pressure / tilt on
	// pressure: 176, cmd 11: 
	// bend: 224, cmd: 14
	 console.log('MIDI data', data);
	switch (type) {
		case 144: // noteOn message 
			MIDIInput.onNoteOn(note, velocity);
			break;
		case 128: // noteOff message 
		MIDIInput.onNoteOff(note, velocity);
			break;
	}

	console.log('data', data, 'cmd', cmd, 'channel', channel);

}

function onStateChange(event) {
	const port = event.port, state = port.state, name = port.name, type = port.type;
	if (type == "input")
		console.log("name", name, "port", port, "state", state);

}

function consolelogMIDIInputs(inputs) {
	const input = inputs.value;
	console.log("Input port : [ type:'" + input.type + "' id: '" + input.id +
		"' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
		"' version: '" + input.version + "']");
}



function onMIDIFailure(e) {
	console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}
