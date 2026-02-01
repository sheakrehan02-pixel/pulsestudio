// Audio utility functions using Web Audio API

let audioContext: AudioContext | null = null;

// Initialize audio context (required for Web Audio API)
export async function initAudioContext(): Promise<AudioContext> {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browsers require user interaction)
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  return audioContext;
}

// Play a click sound (metronome tick) - more musical
export async function playClickSound(frequency: number = 800, duration: number = 0.1) {
  const ctx = await initAudioContext();
  const now = ctx.currentTime;
  
  // Use a more pleasant tone with slight attack
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  // Quick attack, smooth release
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

// Play a piano note with more realistic sound
// Uses multiple oscillators to simulate piano harmonics
export async function playPianoNote(frequency: number, duration: number = 0.3) {
  const ctx = await initAudioContext();
  const now = ctx.currentTime;
  
  // Create a more complex sound with harmonics (like a real piano)
  const harmonics = [
    { freq: frequency, gain: 0.6 }, // Fundamental
    { freq: frequency * 2, gain: 0.3 }, // Octave
    { freq: frequency * 3, gain: 0.1 }, // Fifth
  ];

  harmonics.forEach((harmonic, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = harmonic.freq;
    oscillator.type = index === 0 ? "sine" : "triangle"; // Mix of waveforms
    
    // Low-pass filter for warmer sound
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Envelope: attack, sustain, release
    const attackTime = 0.01;
    const releaseTime = duration * 0.3;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(harmonic.gain * 0.3, now + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

// Play a success sound
export async function playSuccessSound() {
  const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      playPianoNote(freq, 0.2);
    }, index * 50);
  });
}

// Play an error sound
export async function playErrorSound() {
  await playPianoNote(200, 0.2);
}

// Synth-style note (brighter, more sustain)
export async function playSynthNote(frequency: number, duration: number = 0.4) {
  const ctx = await initAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = "sawtooth";
  filter.type = "lowpass";
  filter.frequency.value = 2000;
  filter.Q.value = 2;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

// Marimba-style (wooden percussion)
export async function playMarimbaNote(frequency: number, duration: number = 0.3) {
  const ctx = await initAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

// Drum-style sounds for sequencer
export async function playKick() {
  const ctx = await initAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
  osc.type = "sine";
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  osc.start(now);
  osc.stop(now + 0.2);
}

export async function playSnare() {
  const ctx = await initAudioContext();
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  noise.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;
  const gain = ctx.createGain();
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  noise.start(now);
  noise.stop(now + 0.1);
  const tone = ctx.createOscillator();
  const tg = ctx.createGain();
  tone.connect(tg);
  tg.connect(ctx.destination);
  tone.frequency.value = 200;
  tone.type = "triangle";
  tg.gain.setValueAtTime(0.2, now);
  tg.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  tone.start(now);
  tone.stop(now + 0.08);
}

export async function playHiHat() {
  const ctx = await initAudioContext();
  const now = ctx.currentTime;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  const gain = ctx.createGain();
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
  noise.start(now);
  noise.stop(now + 0.05);
}

