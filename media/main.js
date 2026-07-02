const image = document.getElementById('smash-image');

let audioContext = null;

const vscode = acquireVsCodeApi();

const getAudioContext = () =>
{
    if(!audioContext)
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext
}

const playSynthSmashSound = () => {
    const audioContext = getAudioContext();
    if(audioContext.state === 'suspended')
        audioContext.resume();

    const now = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 0.25;
    const noiseBuffer = audioContext.createBuffer(
        1, 
        bufferSize, 
        audioContext.sampleRate
    );
    const data = noiseBuffer.getChannelData(0);
    for(let i = 0; i < bufferSize; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);


    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(3000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(noiseFilter).connect(noiseGain).connect(audioContext.destination);


    const osc = audioContext.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    const oscGain = audioContext.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(oscGain).connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 0.25);
    osc.start(now);
    osc.stop(now + 0.22);
}

const playSmashSound = () => {
    const soundSrc = document.body.dataset.soundSrc;

    if(soundSrc)
    {
        const audio = new Audio(soundSrc);
        audio.volume = 0.8;
        audio.play().catch(() => playSynthSmashSound());
        return;
    }
    playSynthSmashSound();
}
const smash = () => {
    playSmashSound();

    image.classList.add('pressed');
    setTimeout(() => image.classList.remove('pressed'), 90);

    vscode.postMessage({
        command: 'smash'
    });
}
image.addEventListener('click', smash);