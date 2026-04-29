import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const debouncedSetValue = useMemo(
    () => debounce(setDebouncedValue, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetValue(value);
    return () => {
      debouncedSetValue.cancel();
    };
  }, [value, debouncedSetValue]);

  return debouncedValue;
}

export default useDebounceValue;
