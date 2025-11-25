export function v4(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as Crypto).randomUUID();
  return 'id-' + Math.random().toString(36).substring(2, 9);
}

export async function apiFetch<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export const demoLocations = [
  { name: 'EcoWash Laundry', lat: 34.0522, lng: -118.2437, distance: '1.2 mi' },
  { name: 'QuickClean Express', lat: 34.06, lng: -118.25, distance: '1.5 mi' },
  { name: 'The Laundry Spot', lat: 34.045, lng: -118.235, distance: '0.8 mi' },
];
