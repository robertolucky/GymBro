import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

type Phase = 'idle' | 'rest' | 'exercise' | 'done';

// Synthesises a boxing ring bell strike using inharmonic sine partials
function playBell(type: 'rest' | 'exercise' | 'tick' | 'done') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Core bell strike: inharmonic partials give the metallic "clang" quality
  const strike = (startTime: number, vol = 1.0) => {
    const partials = [
      { freq: 1047, gain: 0.3, decay: 2.2 }, // fundamental ~C6
      { freq: 1319, gain: 0.1, decay: 2.6 }, // E6 — major third
      { freq: 4186, gain: 0.5, decay: 1.5 }, // slightly detuned 2nd
      { freq: 8376, gain: 0.10, decay: 0.35 }, // high transient click
      { freq: 1047, gain: 0.18, decay: 1.8 }, // detune for richness
    ];
    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain * vol, startTime);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + decay);
      osc.start(startTime);
      osc.stop(startTime + decay + 0.05);
    });
  };

  if (type === 'tick') {
    // Soft tap: same bell, quieter & shorter
    const partials = [
      { freq: 1047, gain: 0.18, decay: 0.4 },
      { freq: 2094, gain: 0.09, decay: 0.25 },
      { freq: 4186, gain: 0.06, decay: 0.1 },
    ];
    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + decay + 0.05);
    });
    return;
  }

  if (type === 'done') {
    // Warm C major chime — soft attack, long decay, one octave lower than before
    const chime = (startTime: number, vol = 1.0) => {
      const partials = [
        { freq: 1047, gain: 0.40, decay: 3.2 }, // C6 — warm fundamental
        { freq: 1319, gain: 0.22, decay: 2.6 }, // E6 — major third
        { freq: 1568, gain: 0.16, decay: 2.0 }, // G6 — perfect fifth
        { freq: 2093, gain: 0.10, decay: 1.2 }, // C7 — gentle octave shimmer
      ];
      partials.forEach(({ freq, gain, decay }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.connect(g);
        g.connect(ctx.destination);
        osc.frequency.value = freq;
        // Soft swell instead of hard click
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(gain * vol, startTime + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + decay);
        osc.start(startTime);
        osc.stop(startTime + decay + 0.05);
      });
    };
    // ding — ding — DING (slight pause before last for drama)
    chime(ctx.currentTime,        0.65);
    chime(ctx.currentTime + 0.50, 0.65);
    chime(ctx.currentTime + 1.10, 1.0);
    return;
  }

  // 'exercise' and 'rest' — single full bell ring
  strike(ctx.currentTime);
}

export function AbsTimer() {
  const [totalReps, setTotalReps] = useState(12);
  const [restDuration, setRestDuration] = useState(20);
  const [exerciseDuration, setExerciseDuration] = useState(45);

  const [phase, setPhase] = useState<Phase>('idle');
  const [currentRep, setCurrentRep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = phase === 'rest' ? restDuration : exerciseDuration;
  const progress = totalDuration > 0 ? (timeLeft / totalDuration) : 0;

  // SVG circle gauge
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const startNextPhase = useCallback((rep: number, nextPhase: 'rest' | 'exercise') => {
    setCurrentRep(rep);
    setPhase(nextPhase);
    setTimeLeft(nextPhase === 'rest' ? restDuration : exerciseDuration);
    setRunning(true);
  }, [restDuration]);

  const start = () => {
    setCurrentRep(0);
    startNextPhase(1, 'rest');
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('idle');
    setCurrentRep(0);
    setTimeLeft(0);
    setRunning(false);
  };

  // Tick
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase]);

  // Countdown tick for last 3 seconds of each phase
  useEffect(() => {
    if (running && (phase === 'exercise' || phase === 'rest') && timeLeft > 0 && timeLeft <= 3) {
      playBell('tick');
    }
  }, [timeLeft, running, phase]);

  // Phase transitions on timeLeft reaching 0
  useEffect(() => {
    if (!running || timeLeft !== 0) return;

    if (phase === 'rest') {
      playBell('exercise');
      setPhase('exercise');
      setTimeLeft(exerciseDuration);
    } else if (phase === 'exercise') {
      if (currentRep >= totalReps) {
        playBell('done');
        setPhase('done');
        setRunning(false);
      } else {
        playBell('rest');
        setPhase('rest');
        setCurrentRep((r) => r + 1);
        setTimeLeft(restDuration);
      }
    }
  }, [timeLeft, running, phase, currentRep, totalReps, restDuration]);

  const phaseColor = phase === 'exercise' ? '#a3e635' : phase === 'rest' ? '#60a5fa' : '#71717a';
  const phaseLabel = phase === 'exercise' ? 'EXERCISE' : phase === 'rest' ? 'REST' : phase === 'done' ? 'DONE!' : 'READY';

  const adjustValue = (setter: (v: number) => void, current: number, delta: number, min: number, max: number) => {
    setter(Math.min(max, Math.max(min, current + delta)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-24 pt-6 px-4 sm:px-6 max-w-md mx-auto w-full min-h-screen flex flex-col">

      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Abs<span className="text-lime-400">Timer</span>
        </h1>
      </header>

      {/* Config */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {/* Reps */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Reps</span>
          <button disabled={phase !== 'idle'} onClick={() => adjustValue(setTotalReps, totalReps, 1, 1, 30)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronUp className="w-5 h-5" /></button>
          <span className="text-3xl font-black text-white">{totalReps}</span>
          <button disabled={phase !== 'idle'} onClick={() => adjustValue(setTotalReps, totalReps, -1, 1, 30)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronDown className="w-5 h-5" /></button>
        </div>
        {/* Rest */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Rest (s)</span>
          <button disabled={phase !== 'idle'} onClick={() => adjustValue(setRestDuration, restDuration, 5, 5, 120)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronUp className="w-5 h-5" /></button>
          <span className="text-3xl font-black text-white">{restDuration}</span>
          <button disabled={phase !== 'idle'} onClick={() => adjustValue(setRestDuration, restDuration, -5, 5, 120)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronDown className="w-5 h-5" /></button>
        </div>
        {/* Exercise */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Work (s)</span>
          <button disabled={phase !== 'idle'} onClick={() => adjustValue(setExerciseDuration, exerciseDuration, 5, 5, 120)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronUp className="w-5 h-5" /></button>
          <span className="text-3xl font-black text-white">{exerciseDuration}</span>
          <button disabled={phase !== 'idle'} onClick={() => adjustValue(setExerciseDuration, exerciseDuration, -5, 5, 120)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"><ChevronDown className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center flex-grow justify-center mb-8">
        <div className="relative w-56 h-56">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Track */}
            <circle cx="100" cy="100" r={radius} fill="none" stroke="#27272a" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={phaseColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={phase === 'idle' || phase === 'done' ? circumference : dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold tracking-widest mb-1" style={{ color: phaseColor }}>
              {phaseLabel}
            </span>
            <span className="text-6xl font-black text-white tabular-nums">
              {phase === 'idle' ? '--' : phase === 'done' ? '🎉' : String(timeLeft).padStart(2, '0')}
            </span>
            {phase !== 'idle' && phase !== 'done' && (
              <span className="text-zinc-500 text-sm mt-1">
                Rep {currentRep} / {totalReps}
              </span>
            )}
          </div>
        </div>

        {/* Rep dots */}
        {(phase !== 'idle') && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-6 max-w-xs">
            {Array.from({ length: totalReps }).map((_, i) => {
              const repNum = i + 1;
              const done = repNum < currentRep || phase === 'done';
              const active = repNum === currentRep && phase !== 'done';
              return (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-colors"
                  style={{
                    backgroundColor: done ? '#a3e635' : active ? phaseColor : '#3f3f46',
                    transform: active ? 'scale(1.3)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {phase === 'idle' || phase === 'done' ? (
          <button
            onClick={start}
            className="flex-1 flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black py-4 rounded-2xl text-lg transition-colors active:scale-[0.98]">
            <Play className="w-6 h-6" />
            {phase === 'done' ? 'Again' : 'Start'}
          </button>
        ) : (
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-2xl text-lg transition-colors active:scale-[0.98]">
            {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            {running ? 'Pause' : 'Resume'}
          </button>
        )}
        {phase !== 'idle' && (
          <button
            onClick={reset}
            className="p-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-colors active:scale-[0.98]">
            <RotateCcw className="w-6 h-6" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
