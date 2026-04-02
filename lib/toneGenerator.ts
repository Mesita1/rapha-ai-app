import { Platform } from 'react-native';

let sound: any = null;
let webAudioCtx: any = null;
let webOscLeft: any = null;
let webOscRight: any = null;
let baseFreq = 200;

export async function startBinauralBeat(
  baseFrequency: number,
  beatFrequency: number,
  volume: number = 0.3,
): Promise<void> {
  baseFreq = baseFrequency;

  if (Platform.OS === 'web') {
    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      webAudioCtx = new AudioContext();

      const merger = webAudioCtx.createChannelMerger(2);
      merger.connect(webAudioCtx.destination);

      // Left ear - base frequency
      webOscLeft = webAudioCtx.createOscillator();
      webOscLeft.frequency.value = baseFrequency;
      webOscLeft.type = 'sine';
      const gainLeft = webAudioCtx.createGain();
      gainLeft.gain.value = volume;
      webOscLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0);

      // Right ear - base + beat frequency
      webOscRight = webAudioCtx.createOscillator();
      webOscRight.frequency.value = baseFrequency + beatFrequency;
      webOscRight.type = 'sine';
      const gainRight = webAudioCtx.createGain();
      gainRight.gain.value = volume;
      webOscRight.connect(gainRight);
      gainRight.connect(merger, 0, 1);

      webOscLeft.start();
      webOscRight.start();
    } catch (e) {
      console.warn('Web binaural audio failed:', e);
    }
  } else {
    // Native: Generate a WAV buffer with binaural tones and loop it
    try {
      const { Audio } = require('expo-av');

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const sampleRate = 44100;
      const duration = 5; // 5 second loop
      const numSamples = sampleRate * duration;

      // Create WAV buffer
      const buffer = new ArrayBuffer(44 + numSamples * 4);
      const view = new DataView(buffer);

      // WAV header
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + numSamples * 4, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 2, true); // stereo
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 4, true);
      view.setUint16(32, 4, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, numSamples * 4, true);

      // Generate stereo sine waves
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const leftSample = Math.sin(2 * Math.PI * baseFrequency * t) * volume;
        const rightSample = Math.sin(2 * Math.PI * (baseFrequency + beatFrequency) * t) * volume;

        view.setInt16(44 + i * 4, leftSample * 32767, true);
        view.setInt16(44 + i * 4 + 2, rightSample * 32767, true);
      }

      // Convert to base64
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const uri = `data:audio/wav;base64,${base64}`;

      sound = new Audio.Sound();
      await sound.loadAsync({ uri }, { isLooping: true, volume: Math.min(volume * 1.7, 1.0) });
      await sound.playAsync();
    } catch (e) {
      console.warn('Binaural audio failed:', e);
    }
  }
}

export function updateBeatFrequency(newBeatFreq: number) {
  if (Platform.OS === 'web' && webOscRight) {
    webOscRight.frequency.value = baseFreq + newBeatFreq;
  }
  // On native, would need to regenerate the WAV - skip for now
}

export async function stopBinauralBeat(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      webOscLeft?.stop();
      webOscRight?.stop();
      webAudioCtx?.close();
    } catch {}
    webOscLeft = null;
    webOscRight = null;
    webAudioCtx = null;
  } else {
    try {
      await sound?.stopAsync();
      await sound?.unloadAsync();
    } catch {}
    sound = null;
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
