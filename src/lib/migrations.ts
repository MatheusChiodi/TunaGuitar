import { load, save } from "./storage";

/** Incrementar a cada mudança de formato de dados no localStorage. */
export const SCHEMA_VERSION = 1;
const KEY = "tg.schemaVersion";

// Migrações idempotentes; a chave é a versão de destino.
const MIGRATIONS: Record<number, () => void> = {
  // 2: () => { /* exemplo: adicionar campo novo a registros antigos */ },
};

/** Roda migrações pendentes uma vez, antes de qualquer módulo ler o storage (BP-15). */
export function runMigrations(): void {
  if (typeof window === "undefined") return;
  const current = load<number>(KEY, 0);
  if (current >= SCHEMA_VERSION) return;
  for (let v = current + 1; v <= SCHEMA_VERSION; v++) {
    try {
      MIGRATIONS[v]?.();
    } catch (err) {
      console.error(`Falha na migração v${v}:`, err);
    }
  }
  save(KEY, SCHEMA_VERSION);
}
