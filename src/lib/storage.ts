const KEY = "vja:completed-steps";

export function getCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCompleted(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function toggleCompleted(id: string): string[] {
  const current = getCompleted();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  setCompleted(next);
  return next;
}
