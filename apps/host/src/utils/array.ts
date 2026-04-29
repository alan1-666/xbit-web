export function totalAllKeyInArray<T extends Record<string, any>>(
  array: T[],
  keys: (keyof T)[]
): number {
  return array.reduce((acc, obj) => {
    return acc + keys.reduce((sum, key) => sum + (obj[key] || 0), 0);
  }, 0);
}

export function totalListKeysInArray<T extends Record<string, any>>(
  array: T[],
  keys: (keyof T)[]
): Record<string, number> {
  return array.reduce((acc, obj) => {
    keys.forEach((key) => {
      acc[key as string] = parseFloat((`${acc[key as string] || 0}`)) + parseFloat((`${obj[key] || 0}`));
    });
    return acc;
  }, {} as Record<string, number>);
}

export function totalAllKeyInArrayWithFilter<T extends Record<string, any>>(
  array: T[],
  keys: (keyof T)[],
  filterFn: (item: T) => boolean
): number {
  return array.reduce((acc, obj) => {
    if (filterFn(obj)) {
      return acc + keys.reduce((sum, key) => sum + (obj[key] || 0), 0);
    }
    return acc;
  }, 0);
}

export function totalListKeysInArrayWithFilter<T extends Record<string, any>>(
  array: T[],
  keys: (keyof T)[],
  filterFn: (item: T) => boolean
): Record<string, number> {
  return array.reduce((acc, obj) => {
    if (filterFn(obj)) {
      keys.forEach((key) => {
        acc[key as string] = (acc[key as string] || 0) + (obj[key] || 0);
      });
    }
    return acc;
  }, {} as Record<string, number>);
}

//put all values of key to array and unique
export function getAllValuesOfKey<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): string[] {
  const values = array.map((obj) => obj[key]);
  return Array.from(new Set(values));
}

/**
 * make array as a cycle ring, so next Index is never out of range
 *
 * @param currIdx current index
 * @param delta how many index do you want to jump
 * @param srcArr
 * @return the next safe index that never out of range
 */
export function cycleIndex(currIdx: number, delta: number, srcArr: any[]): number {
  let next = currIdx + delta
  while (next >= srcArr.length) {
    next -= srcArr.length
  }
  return next
}
