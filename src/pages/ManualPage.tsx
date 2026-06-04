import PageShell from "../components/PageShell";

const steps = [
  {
    n: "01",
    t: "Permita o microfone",
    d: "Toque em INICIAR AFINAÇÃO e autorize o acesso ao microfone. Todo o processamento acontece no seu dispositivo.",
  },
  {
    n: "02",
    t: "Toque uma corda",
    d: "No modo AUTO, o afinador identifica sozinho a nota mais próxima. No modo MANUAL, escolha a corda no seletor para travar o alvo.",
  },
  {
    n: "03",
    t: "Leia o ponteiro",
    d: "Ponteiro à esquerda do centro: a nota está grave (APERTE a corda). À direita: está aguda (SOLTE). No centro, com folga de ±cents configurável, está AFINADO.",
  },
  {
    n: "04",
    t: "Ajuste fino",
    d: "Em Configurações você muda a afinação (Padrão, Drop D, Eb, DADGAD), a referência A4 (430–450 Hz) e a tolerância em cents.",
  },
];

export default function ManualPage() {
  return (
    <PageShell title="Manual" subtitle="Como usar o afinador">
      <div className="flex flex-col gap-4">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
            <span className="font-orbitron text-2xl text-primary/70">{s.n}</span>
            <div>
              <h3 className="font-headline text-lg text-on-surface">{s.t}</h3>
              <p className="mt-1 text-sm">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm">
        Dica: ambientes silenciosos melhoram a precisão. Cordas graves (E2/A2) precisam de uma nota sustentada por um
        instante para a leitura estabilizar.
      </p>
    </PageShell>
  );
}
