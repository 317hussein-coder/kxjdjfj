// Web Audio API procedural audio engine for SuperHub 360
// Guarantees zero latency, zero external asset downloads, and fluid 60fps sound fx.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private ambientGain: GainNode | null = null;
  private ambientSources: Map<string, { source: AudioNode; gain: GainNode }> = new Map();

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Soft modern micro-click for buttons and tabs
  public playClick(pitch: number = 600) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Satisfying Bubble Pop sound
  public playPop() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 300 + Math.random() * 400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 2.5, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // Success chime chord
  public playSuccess() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx!.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.45);
      });
    } catch {}
  }

  // Zen bell chime
  public playBell() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.0);
    } catch {}
  }

  // Game synth sound for beat pads / arcade
  public playSynthPad(noteIndex: number) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const baseFreqs = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
      const freq = baseFreqs[noteIndex % baseFreqs.length];

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = noteIndex % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.8, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {}
  }

  // Generative Ambient Noise (Rain, Waves, Campfire, 432Hz tone)
  public toggleAmbientSound(type: string, volume: number) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const existing = this.ambientSources.get(type);
      if (volume <= 0.01) {
        if (existing) {
          existing.gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
          setTimeout(() => {
            try {
              (existing.source as any).stop?.();
              existing.source.disconnect();
              this.ambientSources.delete(type);
            } catch {}
          }, 250);
        }
        return;
      }

      if (existing) {
        existing.gain.gain.linearRampToValueAtTime(volume * 0.15, this.ctx.currentTime + 0.1);
        return;
      }

      // Create new sound generator
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.15, this.ctx.currentTime + 0.3);

      if (type === 'zen432') {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        this.ambientSources.set(type, { source: osc, gain });
      } else if (type === 'whitenoise' || type === 'rain' || type === 'waves' || type === 'fire') {
        // Create noise buffer
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'whitenoise') {
            output[i] = white * 0.4;
          } else {
            // Pink/brown filtered noise
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.95 * b1 + white * 0.1;
            b2 = 0.85 * b2 + white * 0.2;
            output[i] = (b0 + b1 + b2) * 0.3;
          }
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        if (type === 'rain') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
          filter.Q.setValueAtTime(0.8, this.ctx.currentTime);
        } else if (type === 'waves') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        } else if (type === 'fire') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3000, this.ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
        this.ambientSources.set(type, { source: whiteNoise, gain });
      }
    } catch {}
  }

  public stopAllAmbience() {
    this.ambientSources.forEach(item => {
      try {
        (item.source as any).stop?.();
        item.source.disconnect();
      } catch {}
    });
    this.ambientSources.clear();
  }
}

export const soundManager = new SoundEngine();
