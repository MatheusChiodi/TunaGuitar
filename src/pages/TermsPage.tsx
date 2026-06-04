import PageShell from "../components/PageShell";

export default function TermsPage() {
  return (
    <PageShell title="Termos de Uso" subtitle="Condições de utilização">
      <p>
        Ao usar o TunaGuitar você concorda com estes termos. O aplicativo é fornecido gratuitamente, para uso pessoal,
        como uma ferramenta de afinação musical.
      </p>
      <h3 className="font-headline text-lg text-on-surface">Sem garantias</h3>
      <p>
        A afinação por microfone depende da qualidade do áudio, do ruído ambiente e do hardware do dispositivo. O
        TunaGuitar é oferecido "como está", sem garantia de precisão absoluta para usos profissionais críticos.
      </p>
      <h3 className="font-headline text-lg text-on-surface">Responsabilidade</h3>
      <p>
        Não nos responsabilizamos por danos a instrumentos decorrentes do uso. Aperte ou solte as cordas com cuidado,
        respeitando os limites do seu instrumento.
      </p>
      <h3 className="font-headline text-lg text-on-surface">Alterações</h3>
      <p>Estes termos podem ser atualizados a qualquer momento. O uso contínuo implica aceitação da versão vigente.</p>
    </PageShell>
  );
}
