const store = new Map<string, string>();
let counter = 0;

export function storeGossip(text: string): string {
  const id = (++counter).toString(36);
  store.set(id, text);
  return id;
}

export function getGossip(id: string): string | undefined {
  return store.get(id);
}
