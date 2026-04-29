export function getTotalKeysInObject<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): number {
  return keys.reduce((total, key) => {
    const value = obj[key];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

export function getAllKeysHasValueEqualTo<T extends Record<string, any>>(
  obj: T,
  value: boolean | string | number
): (keyof T)[] {
  return Object.keys(obj).filter((key) => obj[key] === value) as (keyof T)[];
}

