import { useEffect, useRef, useState } from "react";
import { Circle, Download, Pause, Play, Repeat2, Square, Volume2 } from "lucide-react";
import Waveform from "../components/Waveform";
import { audio } from "../lib/audio";
import { encodeWav, reverseBuffer } from "../lib/wav";

interface Track {
  buffer: AudioBuffer | null;
  volume: number;
  muted: boolean;
  solo: boolean;
}

const EMPTY: Track = { buffer: null, volume: 0.9, muted: false, solo: false };
const MAX_SECONDS = 30;
const SPEEDS = [0.5, 0.75, 1];

export default function LoopStationPage() {
  const [tracks, setTracks] = useState<Track[]>([{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }, { ...EMPTY }]);
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [bpmSync, setBpmSync] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reverse, setReverse] = useState(false);
  const [masterVol, setMasterVol] = useState(0.9);
  const [loopCount, setLoopCount] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mr = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const recAnalyser = useRef<AnalyserNode | null>(null);
  const recRaf = useRef<number | undefined>(undefined);
  const recTimeout = useRef<number | undefined>(undefined);
  const recCanvas = useRef<HTMLCanvasElement>(null);

  const sources = useRef<(AudioBufferSourceNode | null)[]>([null, null, null, null]);
  const gains = useRef<(GainNode | null)[]>([null, null, null, null]);
  const masterGain = useRef<GainNode | null>(null);
  const loopTimer = useRef<number | undefined>(undefined);

  const patch = (idx: number, p: Partial<Track>) => setTracks((ts) => ts.map((t, i) => (i === idx ? { ...t, ...p } : t)));

  const quantize = (buf: AudioBuffer): AudioBuffer => {
    const ctx = audio.ensure();
    const beat = 60 / bpm;
    const beats = Math.max(1, Math.round(buf.duration / beat));
    const len = Math.round(beats * beat * buf.sampleRate);
    const out = ctx.createBuffer(buf.numberOfChannels, len, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const src = buf.getChannelData(c);
      const dst = out.getChannelData(c);
      for (let i = 0; i < len; i++) dst[i] = src[i] ?? 0;
    }
    return out;
  };

  const stopRecording = () => {
    if (mr.current && mr.current.state !== "inactive") mr.current.stop();
    if (recRaf.current) cancelAnimationFrame(recRaf.current);
    if (recTimeout.current) clearTimeout(recTimeout.current);
    setLevel(0);
  };

  const startRecording = async (idx: number) => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
      stream.current = s;
      const ctx = audio.ensure();
      const srcNode = ctx.createMediaStreamSource(s);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      srcNode.connect(analyser);
      recAnalyser.current = analyser;

      const rec = new MediaRecorder(s);
      mr.current = rec;
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        const arr = await blob.arrayBuffer();
        try {
          let buf = await ctx.decodeAudioData(arr);
          if (bpmSync) buf = quantize(buf);
          patch(idx, { buffer: buf });
        } catch {
          setError("Falha ao decodificar o áudio.");
        }
        s.getTracks().forEach((t) => t.stop());
        stream.current = null;
        recAnalyser.current = null;
        setRecordingIdx(null);
      };
      rec.start();
      setRecordingIdx(idx);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        const an = recAnalyser.current;
        const cv = recCanvas.current;
        if (!an) return;
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3));
        if (cv) {
          const c = cv.getContext("2d");
          if (c) {
            c.clearRect(0, 0, cv.width, cv.height);
            c.strokeStyle = "#ff5555";
            c.lineWidth = 1.5;
            c.beginPath();
            for (let i = 0; i < data.length; i++) {
              const x = (i / data.length) * cv.width;
              const y = (data[i] / 255) * cv.height;
              i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
            }
            c.stroke();
          }
        }
        recRaf.current = requestAnimationFrame(draw);
      };
      recRaf.current = requestAnimationFrame(draw);
      recTimeout.current = window.setTimeout(stopRecording, MAX_SECONDS * 1000);
    } catch {
      setError("Não foi possível acessar o microfone.");
      setRecordingIdx(null);
    }
  };

  const stopPlayback = () => {
    sources.current.forEach((s) => {
      try {
        s?.stop();
      } catch {
        /* já parado */
      }
    });
    sources.current = [null, null, null, null];
    if (loopTimer.current) clearInterval(loopTimer.current);
    setIsPlaying(false);
    setLoopCount(0);
  };

  const play = () => {
    stopPlayback();
    const ctx = audio.ensure();
    void ctx.resume();
    const anySolo = tracks.some((t) => t.solo);
    const mg = ctx.createGain();
    mg.gain.value = masterVol;
    mg.connect(audio.destination);
    masterGain.current = mg;

    let loopDur = 0;
    tracks.forEach((t, i) => {
      if (!t.buffer) return;
      const audible = anySolo ? t.solo : !t.muted;
      const src = ctx.createBufferSource();
      src.buffer = reverse ? reverseBuffer(ctx, t.buffer) : t.buffer;
      src.loop = true;
      src.playbackRate.value = speed;
      const g = ctx.createGain();
      g.gain.value = audible ? t.volume : 0;
      src.connect(g).connect(mg);
      src.start();
      sources.current[i] = src;
      gains.current[i] = g;
      loopDur = Math.max(loopDur, t.buffer.duration);
    });
    if (loopDur === 0) return;
    setIsPlaying(true);
    setLoopCount(1);
    loopTimer.current = window.setInterval(() => setLoopCount((c) => c + 1), (loopDur / speed) * 1000);
  };

  const pause = () => {
    const ctx = audio.ensure();
    if (ctx.state === "running") void ctx.suspend();
    else void ctx.resume();
  };

  // Atualiza ganhos ao vivo (volume/mute/solo).
  useEffect(() => {
    if (!isPlaying) return;
    const anySolo = tracks.some((t) => t.solo);
    tracks.forEach((t, i) => {
      const g = gains.current[i];
      if (g) g.gain.value = (anySolo ? t.solo : !t.muted) ? t.volume : 0;
    });
    if (masterGain.current) masterGain.current.gain.value = masterVol;
  }, [tracks, masterVol, isPlaying]);

  useEffect(() => () => { stopRecording(); stopPlayback(); }, []);

  const exportMix = async () => {
    const ctx = audio.ensure();
    const anySolo = tracks.some((t) => t.solo);
    const active = tracks.filter((t) => t.buffer && (anySolo ? t.solo : !t.muted));
    if (!active.length) return;
    const loopDur = Math.max(...active.map((t) => t.buffer!.duration));
    const off = new OfflineAudioContext(2, Math.ceil(loopDur * ctx.sampleRate), ctx.sampleRate);
    active.forEach((t) => {
      const src = off.createBufferSource();
      src.buffer = reverse ? reverseBuffer(off, t.buffer!) : t.buffer!;
      const g = off.createGain();
      g.gain.value = t.volume * masterVol;
      src.connect(g).connect(off.destination);
      src.start(0);
    });
    const rendered = await off.startRendering();
    const a = document.createElement("a");
    a.download = "tunaguitar-loop.wav";
    a.href = URL.createObjectURL(encodeWav(rendered));
    a.click();
  };

  return (
    <div className="w-full max-w-4xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Loop Station</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">Grave camadas e toque em loop · máx {MAX_SECONDS}s</p>

      {error && <div className="mb-4 rounded-lg border border-error/40 bg-[#2a0a0a] px-4 py-2 font-share-tech text-sm text-error">{error}</div>}

      {/* Monitor de gravação */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
        <div className="flex h-24 w-3 flex-col-reverse overflow-hidden rounded bg-[#1a1a1a]">
          <div className="w-full bg-linear-to-t from-tuned via-secondary to-error transition-[height] duration-75" style={{ height: `${level * 100}%` }} />
        </div>
        <canvas ref={recCanvas} width={600} height={96} className="h-24 flex-1 rounded bg-[#0a0a0a]" />
      </div>

      {/* Transporte */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button onClick={isPlaying ? stopPlayback : play} className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 ${isPlaying ? "border-accent bg-accent/20 text-accent" : "border-[#333] text-on-surface"}`}>
          {isPlaying ? <Square className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-6 w-6 fill-current" />}
        </button>
        <button onClick={pause} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#333] text-on-surface-variant hover:text-primary">
          <Pause className="h-5 w-5" />
        </button>
        <button onClick={() => setReverse((r) => !r)} className={`flex h-12 cursor-pointer items-center gap-1.5 rounded-full border px-4 font-label text-[10px] uppercase tracking-widest ${reverse ? "border-accent text-accent" : "border-[#333] text-on-surface-variant"}`}>
          <Repeat2 className="h-4 w-4" /> Reverse
        </button>
        <div className="flex rounded-full border border-[#333] p-1">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className={`cursor-pointer rounded-full px-3 py-1.5 font-share-tech text-xs ${speed === s ? "bg-accent/15 text-accent" : "text-on-surface-variant"}`}>
              {s}x
            </button>
          ))}
        </div>
        {isPlaying && <span className="font-share-tech text-sm text-secondary">{loopCount}x</span>}
      </div>

      {/* BPM sync + master */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">BPM sync ({bpm})</span>
            <button onClick={() => setBpmSync((b) => !b)} className={`relative h-5 w-10 rounded-full border border-[#222] ${bpmSync ? "bg-tuned" : "bg-[#0a0a0a]"}`}>
              <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left]" style={{ left: bpmSync ? 22 : 2 }} />
            </button>
          </div>
          <input type="range" min={40} max={220} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
        </div>
        <div className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
          <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Volume master</span>
          <input type="range" min={0} max={1} step={0.01} value={masterVol} onChange={(e) => setMasterVol(Number(e.target.value))} className="mt-3" />
        </div>
      </div>

      {/* Tracks */}
      <div className="grid gap-3 sm:grid-cols-2">
        {tracks.map((t, i) => {
          const rec = recordingIdx === i;
          return (
            <div key={i} className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Track {i + 1}</span>
                <button
                  onClick={() => (rec ? stopRecording() : startRecording(i))}
                  disabled={recordingIdx !== null && !rec}
                  className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 font-label text-[10px] uppercase tracking-widest disabled:opacity-30 ${rec ? "animate-pulse border-error bg-error/20 text-error" : "border-error/50 text-error"}`}
                >
                  <Circle className="h-3 w-3 fill-current" /> {rec ? "Gravando" : t.buffer ? "Regravar" : "Rec"}
                </button>
              </div>
              <Waveform buffer={t.buffer} />
              <div className="mt-2 flex items-center gap-2">
                <input type="range" min={0} max={1} step={0.01} value={t.volume} onChange={(e) => patch(i, { volume: Number(e.target.value) })} className="flex-1" disabled={!t.buffer} />
                <button onClick={() => patch(i, { muted: !t.muted })} className={`cursor-pointer rounded px-2 py-1 font-label text-[10px] uppercase ${t.muted ? "bg-error/20 text-error" : "text-on-surface-variant"}`}>M</button>
                <button onClick={() => patch(i, { solo: !t.solo })} className={`cursor-pointer rounded px-2 py-1 font-label text-[10px] uppercase ${t.solo ? "bg-secondary/20 text-secondary" : "text-on-surface-variant"}`}>S</button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={exportMix} className="mt-6 flex cursor-pointer items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 font-label text-[11px] uppercase tracking-widest text-accent">
        <Volume2 className="h-4 w-4" /> <Download className="h-4 w-4" /> Exportar mix (WAV)
      </button>
    </div>
  );
}
