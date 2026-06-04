import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch, median, rms } from "../lib/pitch";

const FFT_SIZE = 8192; // buffer grande → resolução nas cordas graves (Mi 82 Hz)
const HOLD_MS = 250; // mantém a última leitura por um instante (evita piscar)
const SMOOTH_FRAMES = 6; // janela da mediana temporal (mata o tremor da agulha)
const MIN_CLARITY = 0.8; // confiança mínima do YIN para aceitar a leitura
const JUMP_CENTS = 250; // salto > 2.5 semitons = troca de corda → zera o histórico
const MIN_FREQ = 60; // abaixo do Mi grave (82 Hz) com margem
const MAX_FREQ = 1200; // acima do Mi agudo (330 Hz) com folga p/ harmônicos

interface PitchState {
  frequency: number | null;
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * @param sensitivity 0..1 — controla o gate de RMS (maior = capta sinal mais fraco).
 */
export function usePitchDetection(sensitivity = 0.5): PitchState {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufRef = useRef(new Float32Array(FFT_SIZE));
  const lastHitRef = useRef<number>(0);
  const historyRef = useRef<number[]>([]);

  // Lido dentro do loop sem reiniciá-lo quando o usuário ajusta o slider.
  const sensitivityRef = useRef(sensitivity);
  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    historyRef.current = [];
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
          // CRÍTICO: desligar processamento que distorce o pitch.
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      await ctx.resume(); // iOS: AudioContext começa suspenso
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0; // não suavizar aqui — fazemos via mediana
      source.connect(analyser);
      analyserRef.current = analyser;

      historyRef.current = [];
      setIsListening(true);

      const tick = () => {
        const analyser = analyserRef.current;
        const ctx = audioCtxRef.current;
        if (!analyser || !ctx) return;

        analyser.getFloatTimeDomainData(bufRef.current);
        const now = performance.now();

        // Gate de volume sensível à config: maior sensibilidade → limiar menor.
        const minRMS = 0.004 + (1 - sensitivityRef.current) * 0.021;
        if (rms(bufRef.current) < minRMS) {
          if (now - lastHitRef.current > HOLD_MS) {
            historyRef.current = [];
            setFrequency(null);
          }
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const result = detectPitch(bufRef.current, ctx.sampleRate, {
          minFrequency: MIN_FREQ,
          maxFrequency: MAX_FREQ,
        });

        if (result && result.clarity >= MIN_CLARITY) {
          const hist = historyRef.current;
          const ref = hist.length ? median(hist) : result.frequency;
          // Salto grande = nova corda/nota → recomeça a suavização do zero.
          if (Math.abs(1200 * Math.log2(result.frequency / ref)) > JUMP_CENTS) hist.length = 0;
          hist.push(result.frequency);
          if (hist.length > SMOOTH_FRAMES) hist.shift();

          lastHitRef.current = now;
          setFrequency(Math.round(median(hist) * 10) / 10);
        } else if (now - lastHitRef.current > HOLD_MS) {
          historyRef.current = [];
          setFrequency(null);
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      const name = (e as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "Permissão de microfone negada. Libere o microfone no cadeado da barra de endereços."
          : name === "NotFoundError"
            ? "Nenhum microfone encontrado."
            : name === "NotReadableError"
              ? "Microfone em uso por outro programa."
              : "Não foi possível acessar o microfone.",
      );
      setIsListening(false);
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { frequency, isListening, error, start, stop };
}
