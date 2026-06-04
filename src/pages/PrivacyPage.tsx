import PageShell from "../components/PageShell";

export default function PrivacyPage() {
  return (
    <PageShell title="Privacidade" subtitle="Seu áudio nunca sai do dispositivo">
      <p>
        O TunaGuitar é um afinador que roda inteiramente no seu navegador. O som captado pelo microfone é analisado
        localmente, em tempo real, apenas para detectar a frequência da nota tocada.
      </p>
      <h3 className="font-headline text-lg text-on-surface">O que coletamos</h3>
      <p>
        Nada. Não gravamos, não armazenamos e não enviamos o áudio do microfone para nenhum servidor. Não há cadastro,
        login ou rastreamento de uso.
      </p>
      <h3 className="font-headline text-lg text-on-surface">Permissão de microfone</h3>
      <p>
        A permissão é solicitada apenas quando você inicia a afinação e é usada exclusivamente para a detecção de pitch.
        Ao parar a afinação, o acesso ao microfone é encerrado.
      </p>
      <h3 className="font-headline text-lg text-on-surface">Preferências</h3>
      <p>
        Configurações como afinação, A4 e tolerância ficam apenas na memória da sessão atual do navegador, no seu
        dispositivo.
      </p>
    </PageShell>
  );
}
