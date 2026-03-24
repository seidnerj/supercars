let audioCtx;
function initAudio() { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

function playSound(type) {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    try {
        if (type === 'shoot') {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.frequency.setValueAtTime(880, t);
            o.frequency.exponentialRampToValueAtTime(440, t + 0.08);
            g.gain.setValueAtTime(0.12, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            o.start(t); o.stop(t + 0.08);
        } else if (type === 'hit') {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(200, t);
            o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
            g.gain.setValueAtTime(0.2, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            o.start(t); o.stop(t + 0.15);
        } else if (type === 'explosion') {
            const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.4, audioCtx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
            const s = audioCtx.createBufferSource(), g = audioCtx.createGain();
            s.buffer = buf; s.connect(g); g.connect(audioCtx.destination);
            g.gain.setValueAtTime(0.3, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            s.start(t);
        } else if (type === 'missileHit') {
            const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.2);
            const s = audioCtx.createBufferSource(), g = audioCtx.createGain();
            s.buffer = buf; s.connect(g); g.connect(audioCtx.destination);
            g.gain.setValueAtTime(0.35, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            s.start(t);
            const o = audioCtx.createOscillator(), g2 = audioCtx.createGain();
            o.connect(g2); g2.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(80, t);
            o.frequency.exponentialRampToValueAtTime(30, t + 0.3);
            g2.gain.setValueAtTime(0.25, t);
            g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            o.start(t); o.stop(t + 0.3);
        } else if (type === 'powerup') {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.frequency.setValueAtTime(500, t);
            o.frequency.exponentialRampToValueAtTime(1200, t + 0.2);
            g.gain.setValueAtTime(0.12, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            o.start(t); o.stop(t + 0.25);
        } else if (type === 'shield') {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(600, t);
            o.frequency.setValueAtTime(800, t + 0.1);
            g.gain.setValueAtTime(0.1, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            o.start(t); o.stop(t + 0.4);
        } else if (type === 'alienShoot') {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'square';
            o.frequency.setValueAtTime(250, t);
            o.frequency.exponentialRampToValueAtTime(80, t + 0.12);
            g.gain.setValueAtTime(0.08, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            o.start(t); o.stop(t + 0.12);
        }
    } catch (e) {}
}
