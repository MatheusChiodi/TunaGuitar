import { useCallback, useEffect, useRef, useState } from "react";
import { autoCorrelate } from "../lib/pitch";

const FFT_SIZE = 2048;
const HOLD_MS = 250; // segura a última leitura por um instante para evitar piscadas

interface PitchState {
  frequency: number | null;
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function usePitchDetection(): PitchState {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufRef = useRef(new Float32Array(FFT_SIZE));
  const lastHitRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    setFrequency(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microfone não suportado neste navegador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });
      streamRef.current = stream;

      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      await ctx.resume();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);

      const tick = () => {
        const analyser = analyserRef.current;
        const ctx = audioCtxRef.current;
        if (!analyser || !ctx) return;

        analyser.getFloatTimeDomainData(bufRef.current);
        const freq = autoCorrelate(bufRef.current, ctx.sampleRate);

        const now = performance.now();
        if (freq > 0) {
          lastHitRef.current = now;
          setFrequency(Math.round(freq * 10) / 10);
        } else if (now - lastHitRef.current > HOLD_MS) {
          setFrequency(null);
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      const name = (e as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "Permissão de microfone negada."
          : name === "NotFoundError"
            ? "Nenhum microfone encontrado."
            : "Não foi possível acessar o microfone.",
      );
      setIsListening(false);
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { frequency, isListening, error, start, stop };
}
