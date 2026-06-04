import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  RadarController,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Filler,
  Legend,
  Tooltip,
} from "chart.js";

// react-chartjs-2 v5 não registra componentes automaticamente.
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  RadarController,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Filler,
  Legend,
  Tooltip,
);

// Tema escuro global — aplicado uma vez antes de qualquer gráfico.
Chart.defaults.color = "#9490A0";
Chart.defaults.borderColor = "rgba(255,255,255,0.06)";
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 11;
Chart.defaults.animation = { duration: 900, easing: "easeOutExpo" };
Chart.defaults.plugins.legend.display = false;

const tt = Chart.defaults.plugins.tooltip;
tt.backgroundColor = "#16161F";
tt.borderColor = "rgba(255,255,255,0.1)";
tt.borderWidth = 1;
tt.titleColor = "#F0EBE0";
tt.bodyColor = "#9490A0";
tt.padding = 12;
tt.cornerRadius = 8;
tt.displayColors = false;
