import { TTLData, TTLWrapper } from '@/types/holding.ts'

export function saveToLocalStorageWithTTL<T>(key: string, value: T, ttlMs: number): void {
  if (typeof window === 'undefined') return; // Skip during SSR

  const expiry = Date.now() + ttlMs;
  try {
    localStorage.setItem(key, JSON.stringify({ value, expiry }));
  } catch (err) {
    console.error(`Failed to save key "${key}" to localStorage`, err);
  }
}

export function getFromLocalStorageWithTTL<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  let item: string | null;
  try {
    item = localStorage.getItem(key);
  } catch (err) {
    console.error(`Failed to read key "${key}" from localStorage`, err);
    return null;
  }

  if (!item) return null;

  try {
    const { value, expiry } = JSON.parse(item) as TTLData<T>;
    if (Date.now() < expiry) return value;

    localStorage.removeItem(key); // expired
  } catch (err) {
    console.error(`Failed to parse localStorage item for key "${key}"`, err);
    localStorage.removeItem(key); // corrupted
  }

  return null;
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to remove key "${key}" from localStorage`, err);
  }
}

export function appendToLocalStorageArrayWithTTL<T extends { id: string }>(
  key: string,
  item: T,
  ttlMs: number
): void {
  if (typeof window === 'undefined') return;

  try {
    const now = Date.now();
    const raw = localStorage.getItem(key);
    let existing: T[] = [];
    let expiry = now + ttlMs;

    if (raw) {
      const parsed = JSON.parse(raw) as TTLWrapper<T>;
      if (now < parsed.expiry) {
        existing = parsed.value;
        expiry = parsed.expiry;
      }
    }

    const exists = existing.some((i) => i.id === item.id);
    if (!exists) existing.push(item);

    localStorage.setItem(key, JSON.stringify({ value: existing, expiry }));
  } catch (err) {
    console.error(`Failed to append item to localStorage under key "${key}"`, err);
  }
}

export function getArrayFromLocalStorageWithTTL<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const item = localStorage.getItem(key);
    if (!item) return [];

    const { value, expiry } = JSON.parse(item) as TTLData<T>;
    if (Date.now() < expiry && Array.isArray(value)) {
      return value;
    }

    localStorage.removeItem(key); // expired or invalid
  } catch (err) {
    console.error(`Failed to read or parse key "${key}" from localStorage`, err);
    localStorage.removeItem(key);
  }

  return [];
}

export function removeItemFromLocalStorageArray<T extends { id?: string }>(
  key: string,
  id?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const item = localStorage.getItem(key);
    if (!item) return;

    const { value, expiry } = JSON.parse(item) as TTLWrapper<T>;

    const updated = value?.filter((entry: T) => entry?.id !== id);

    localStorage.setItem(key, JSON.stringify({ value: updated, expiry }));
  } catch (err) {
    console.error(`Failed to remove item from localStorage array under key "${key}"`, err);
  }
}


export function loadFirstPageFromStorage<T>(key: string, defaultValue: T = [] as unknown as T): T{
  const storedData = sessionStorage.getItem(key)
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing smartMoneyList from sessionStorage:', error)
    }
  }
  return defaultValue;
}

export function saveFirstPageToStorage<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving smartMoneyList to sessionStorage:', error)
  }
}
