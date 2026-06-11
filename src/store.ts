export interface GossipEntry {
  text: string;
  userId: number;
  username?: string;
  firstName: string;
}

const store = new Map<string, GossipEntry>();
let counter = 0;

export function storeGossip(entry: GossipEntry): string {
  const id = (++counter).toString(36);
  store.set(id, entry);
  return id;
}

export function getGossip(id: string): GossipEntry | undefined {
  return store.get(id);
}

export function deleteGossip(id: string): void {
  store.delete(id);
}
