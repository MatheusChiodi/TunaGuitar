import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Ao mudar (ex.: rota), limpa o erro para tentar renderizar o novo conteúdo. */
  resetKey?: string;
}
interface State {
  error: Error | null;
}

/** Isola falhas de um módulo para não derrubar o app inteiro (BP-08, adaptado a React). */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Módulo falhou:", error);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="flex w-full flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="font-headline text-xl text-on-surface">Módulo indisponível</p>
          <p className="max-w-md font-share-tech text-sm text-on-surface-variant">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="cursor-pointer rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-label text-xs uppercase tracking-widest text-accent"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
