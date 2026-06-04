// SEO por rota: como é um SPA, atualizamos title/description/canonical a cada
// navegação para que cada módulo seja indexado com suas próprias palavras-chave.
const SITE = "https://tuna-guitar.vercel.app";

type RouteMeta = { title: string; description: string; noindex?: boolean };

const HOME: RouteMeta = {
  title: "Afinador de Violão Online Grátis — Pelo Microfone | TunaGuitar",
  description:
    "Afinador de violão online grátis e preciso. Afine pelo microfone do celular ou computador em segundos, sem instalar nada. Inclui metrônomo, acordes e treino de ouvido.",
};

const ROUTES: Record<string, RouteMeta> = {
  "/": HOME,
  "/metronomo": {
    title: "Metrônomo Online Grátis — BPM e Tap Tempo | TunaGuitar",
    description:
      "Metrônomo online grátis com ajuste de BPM, tap tempo e compassos variados. Treine seu tempo no violão direto no navegador, sem instalar nada.",
  },
  "/acordes": {
    title: "Acordes de Violão — Biblioteca com Diagramas | TunaGuitar",
    description:
      "Biblioteca de acordes de violão com diagramas claros. Veja as posições dos dedos de acordes maiores, menores, com sétima e pestana.",
  },
  "/cifrador": {
    title: "Cifrador de Violão Online — Monte suas Cifras | TunaGuitar",
    description:
      "Monte e visualize cifras de violão online. Escreva a letra com os acordes e transponha o tom com um clique, grátis no navegador.",
  },
  "/progressoes": {
    title: "Progressões de Acordes para Violão | TunaGuitar",
    description:
      "Gere progressões de acordes para violão em qualquer tom. Descubra sequências populares e harmonias para compor e praticar.",
  },
  "/ritmos": {
    title: "Ritmos e Levadas de Violão | TunaGuitar",
    description:
      "Aprenda e pratique ritmos e levadas de violão com padrões de batida. Ajuste o andamento e treine a mão direita.",
  },
  "/ouvido": {
    title: "Treino de Ouvido Musical Online | TunaGuitar",
    description:
      "Treino de ouvido online para músicos: reconheça notas, intervalos e acordes de ouvido. Desenvolva ouvido relativo e absoluto, grátis.",
  },
  "/escalas": {
    title: "Escalas de Violão — Visualizador no Braço | TunaGuitar",
    description:
      "Visualizador de escalas de violão no braço do instrumento. Veja escalas maiores, menores, pentatônicas e modos em qualquer tom.",
  },
  "/capotraste": {
    title: "Calculadora de Capotraste e Transposição | TunaGuitar",
    description:
      "Calculadora de capotraste para violão: descubra em qual casa colocar o capo e transponha acordes para tocar em qualquer tom.",
  },
  "/loop": {
    title: "Loop Station Online — Gravador de Loops | TunaGuitar",
    description:
      "Loop station online grátis: grave e sobreponha camadas de áudio no navegador para criar bases e praticar improviso no violão.",
  },
  "/diario": {
    title: "Diário de Prática de Violão | TunaGuitar",
    description:
      "Registre suas sessões de estudo de violão, acompanhe o progresso e mantenha a constância com o diário de prática do TunaGuitar.",
  },
  "/conquistas": {
    title: "Conquistas e Metas de Estudo | TunaGuitar",
    description:
      "Acompanhe suas conquistas e metas de estudo de violão. Ganhe medalhas conforme evolui na prática diária com o TunaGuitar.",
  },
  "/teoria": {
    title: "Teoria Musical para Violão | TunaGuitar",
    description:
      "Fundamentos de teoria musical para violonistas: notas, intervalos, formação de acordes e campo harmônico de forma simples.",
  },
  "/manual": {
    title: "Manual de Uso — TunaGuitar",
    description:
      "Manual do TunaGuitar: como usar o afinador, o metrônomo, os acordes e as demais ferramentas de prática de violão.",
  },
  "/privacidade": {
    title: "Política de Privacidade — TunaGuitar",
    description:
      "Política de privacidade do TunaGuitar. O app funciona localmente no navegador e não coleta dados pessoais.",
  },
  "/termos": {
    title: "Termos de Uso — TunaGuitar",
    description: "Termos de uso do TunaGuitar, afinador de violão online gratuito.",
  },
  "/config": {
    title: "Configurações — TunaGuitar",
    description: "Ajuste preferências do afinador, atalhos e aparência do TunaGuitar.",
    noindex: true,
  },
  "/performance": {
    title: "Modo Performance — TunaGuitar",
    description: "Modo performance do TunaGuitar para uso ao vivo.",
    noindex: true,
  },
};

function upsertMeta(key: "name" | "property", value: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function applyRouteMeta(pathname: string) {
  const meta = ROUTES[pathname] ?? {
    title: "TunaGuitar — Afinador de Violão Online",
    description: HOME.description,
  };
  const url = SITE + (pathname === "/" ? "/" : pathname);

  document.title = meta.title;
  upsertMeta("name", "description", meta.description);
  upsertMeta("name", "robots", meta.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
  upsertMeta("property", "og:title", meta.title);
  upsertMeta("property", "og:description", meta.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("name", "twitter:title", meta.title);
  upsertMeta("name", "twitter:description", meta.description);
  upsertCanonical(url);
}
