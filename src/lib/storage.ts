import { toast } from "./toast";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err instanceof DOMException && (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      toast.warning("⚠️ Armazenamento cheio. Limpe dados antigos em Configurações.");
    }
    return false;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* indisponível */
  }
}
