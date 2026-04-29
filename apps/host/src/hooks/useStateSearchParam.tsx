/**
 * useStateSearchParam is a custom React hook that manages a state variable
 * synchronized with a URL search parameter. It allows you to get and set
 * the value of a specific search parameter, providing a convenient way to
 * handle state that should persist across page reloads or navigation.
 */
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useCallback } from 'react';

const useStateSearchParam = <T,>(paramName: string, defaultValue: T) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<T>(searchParams.get(paramName) as T || defaultValue);

  const setStateWithSearchParam = useCallback((newValue: T) => {
    setState(newValue);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      // If newValue is an object, convert it to a JSON string
      if (typeof newValue === 'object' && newValue !== null) {
        newValue = JSON.stringify(newValue) as T;
      }
      else if (typeof newValue === 'undefined' || newValue === null || newValue === '') {
        newParams.delete(paramName);
      } else {
        newParams.set(paramName, `${newValue}`);
      }
      return newParams;
    });
  }, [paramName, setSearchParams]);

  return [state, setStateWithSearchParam] as const;
};

export default useStateSearchParam;