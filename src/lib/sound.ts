import type { ToastType } from "./toast";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext ?? (window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) audioContext = new AudioCtor();
  return audioContext;
}

function playTone(frequency: number, startTime: number, duration: number, ctx: AudioContext) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

const NOTES: Record<ToastType, number[]> = {
  success: [880, 1174.66],
  info: [740],
  warning: [523.25, 415.3],
  error: [349.23, 261.63],
};

export function playToastSound(type: ToastType) {
  try {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    NOTES[type].forEach((freq, i) => {
      playTone(freq, now + i * 0.09, 0.16, ctx);
    });
  } catch {
    // Audio is a nice-to-have; never let it break the UI.
  }
}
