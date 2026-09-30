/**
 * Reef Guardian - Web Audio API Sound Synthesizer
 * Generates rich, relaxing underwater soundscapes and feedback effects procedurally.
 */

window.ReefAudio = (function() {
  let ctx = null;
  let masterGain = null;
  let ambientGain = null;
  let sfxGain = null;
  let isMuted = false;
  let isAmbientPlaying = false;
  let ambientNoiseNode = null;
  let ambientFilter = null;
  let lfoNode = null;
  let lfoGain = null;

  function initContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.7, ctx.currentTime);

        ambientGain = ctx.createGain();
        ambientGain.gain.setValueAtTime(0.25, ctx.currentTime);

        sfxGain = ctx.createGain();
        sfxGain.gain.setValueAtTime(0.6, ctx.currentTime);

        ambientGain.connect(masterGain);
        sfxGain.connect(masterGain);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  // Generate pink/brown ocean noise buffer
  function createBrownianNoiseBuffer(seconds = 5) {
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brownian approximation
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  function startAmbientOcean() {
    initContext();
    if (!ctx || isAmbientPlaying) return;

    try {
      const buffer = createBrownianNoiseBuffer(6);
      ambientNoiseNode = ctx.createBufferSource();
      ambientNoiseNode.buffer = buffer;
      ambientNoiseNode.loop = true;

      ambientFilter = ctx.createBiquadFilter();
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.setValueAtTime(220, ctx.currentTime);
      ambientFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      // Low frequency oscillator for wave swell effect
      lfoNode = ctx.createOscillator();
      lfoGain = ctx.createGain();
      lfoNode.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec ocean swell cycle
      lfoGain.gain.setValueAtTime(80, ctx.currentTime);

      lfoNode.connect(lfoGain);
      lfoGain.connect(ambientFilter.frequency);

      ambientNoiseNode.connect(ambientFilter);
      ambientFilter.connect(ambientGain);

      ambientNoiseNode.start(0);
      lfoNode.start(0);
      isAmbientPlaying = true;
    } catch (e) {
      console.warn('Audio autoplay prevented or error:', e);
    }
  }

  function stopAmbientOcean() {
    if (ambientNoiseNode) {
      try { ambientNoiseNode.stop(); } catch (e) {}
      ambientNoiseNode = null;
    }
    if (lfoNode) {
      try { lfoNode.stop(); } catch (e) {}
      lfoNode = null;
    }
    isAmbientPlaying = false;
  }

  // --- Sound Effects ---

  // Bubble pop (water bubble bursting or collected)
  function playBubble(pitchOffset = 1.0) {
    if (isMuted) return;
    initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 300 * pitchOffset;
    const endFreq = 750 * pitchOffset;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // Clean splash / debris pickup
  function playDebrisCollect() {
    if (isMuted) return;
    initContext();
    if (!ctx) return;

    playBubble(1.2);
    setTimeout(() => playBubble(1.6), 50);

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.15); // E5
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  // Coral planting / restoration harmonic chord
  function playCoralChime() {
    if (isMuted) return;
    initContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const t = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.15, t + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.65);
    });
  }

  // Warning sonar ping (for marine heatwave or poaching threat)
  function playSonarPing() {
    if (isMuted) return;
    initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5 tone
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 1.45);
  }

  // Species unlock triumphant chord
  function playUnlockFanfare() {
    if (isMuted) return;
    initContext();
    if (!ctx) return;

    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    const t = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);

      gain.gain.setValueAtTime(0.001, t + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.09 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.8);

      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.85);
    });
  }

  // COTS cull or predator interaction thud
  function playCullSound() {
    if (isMuted) return;
    initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Button interaction click
  function playClick() {
    if (isMuted) return;
    initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.7, ctx.currentTime);
    }
    return isMuted;
  }

  function setVolume(val) {
    if (masterGain && ctx && !isMuted) {
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime);
    }
  }

  return {
    init: initContext,
    startAmbient: startAmbientOcean,
    stopAmbient: stopAmbientOcean,
    playBubble: playBubble,
    playDebrisCollect: playDebrisCollect,
    playCoralChime: playCoralChime,
    playSonarPing: playSonarPing,
    playUnlockFanfare: playUnlockFanfare,
    playCullSound: playCullSound,
    playClick: playClick,
    toggleMute: toggleMute,
    setVolume: setVolume,
    get isMuted() { return isMuted; },
    get isAmbient() { return isAmbientPlaying; }
  };
})();
