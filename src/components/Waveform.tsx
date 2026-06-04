import { useEffect, useRef } from "react";

interface Props {
  buffer: AudioBuffer | null;
  height?: number;
  color?: string;
}

/** Desenha a forma de onda de um AudioBuffer em canvas. */
export default function Waveform({ buffer, height = 48, color = "#ff5555" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width;
    const H = cv.height;
    ctx.clearRect(0, 0, W, H);
    if (!buffer) {
      ctx.strokeStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      return;
    }
    const data = buffer.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / W));
    ctx.fillStyle = color;
    for (let x = 0; x < W; x++) {
      let min = 1;
      let max = -1;
      for (let i = 0; i < step; i++) {
        const v = data[x * step + i] || 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const y1 = ((1 - max) / 2) * H;
      const y2 = ((1 - min) / 2) * H;
      ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
    }
  }, [buffer, color]);

  return <canvas ref={ref} width={300} height={height} className="w-full" style={{ height }} />;
}
