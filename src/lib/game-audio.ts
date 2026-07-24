type Tone = {
  frequency: number;
  duration: number;
  offset?: number;
  type?: OscillatorType;
  volume?: number;
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined" || !window.AudioContext) {
    return null;
  }

  audioContext ??= new window.AudioContext();
  return audioContext;
}

async function playPattern(tones: Tone[]) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    const startTime = context.currentTime + 0.015;

    for (const tone of tones) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const toneStart = startTime + (tone.offset ?? 0);
      const toneEnd = toneStart + tone.duration;
      const volume = tone.volume ?? 0.07;

      oscillator.type = tone.type ?? "square";
      oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
      gain.gain.setValueAtTime(0.0001, toneStart);
      gain.gain.exponentialRampToValueAtTime(volume, toneStart + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(toneStart);
      oscillator.stop(toneEnd + 0.02);
    }
  } catch {
    // Visual cues remain available when the browser blocks audio playback.
  }
}

export async function unlockGameAudio() {
  const context = getAudioContext();

  if (context?.state === "suspended") {
    try {
      await context.resume();
    } catch {
      // A later click on the sound control can try again.
    }
  }
}

export function playRoundStartSound() {
  return playPattern([
    { frequency: 330, duration: 0.09 },
    { frequency: 440, duration: 0.09, offset: 0.1 },
    { frequency: 660, duration: 0.18, offset: 0.2 },
  ]);
}

export function playWarningSound() {
  return playPattern([
    { frequency: 520, duration: 0.08 },
    { frequency: 520, duration: 0.08, offset: 0.13 },
  ]);
}

export function playCountdownTickSound() {
  return playPattern([{ frequency: 760, duration: 0.045, volume: 0.045 }]);
}

export function playVotingSound() {
  return playPattern([
    { frequency: 220, duration: 0.12, type: "sawtooth" },
    { frequency: 165, duration: 0.2, offset: 0.12, type: "sawtooth" },
  ]);
}

export function playResultsSound() {
  return playPattern([
    { frequency: 440, duration: 0.09 },
    { frequency: 554, duration: 0.09, offset: 0.1 },
    { frequency: 659, duration: 0.22, offset: 0.2 },
  ]);
}

