import React, {
  useRef,
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";

/** */
/**
 * createFastContext is a utility function to create a fast context for managing state in React.
 * It provides a way to get, set, and subscribe to changes in the context state.
 *
 * @param initialState - The initial state of the context.
 * @returns An object containing the FastContextProvider and useFastContextFields hook.
 */

/**
createFastContext is a utility function to create a fast context for managing state in React.
// store.ts
import createFastContext from './createFastContext'

type AppState = {
  count: number
  user: { name: string }
}

const initialState: AppState = {
  count: 0,
  user: { name: 'Alice' },
}

export const { FastContextProvider, useFastContextFields } = createFastContext<AppState>(initialState) 
 */


/**
 * 
 * wrapper component inside your app to provide the context
 * import { FastContextProvider } from './store'

export default function App() {
  return (
    <FastContextProvider>
      <Counter />
      <UserName />
    </FastContextProvider>
  )
}
 */

/**
 * use context in your components
// Counter.tsx
import { useFastContextFields } from './store'

export function Counter() {
  const { count } = useFastContextFields(['count'])

  return (
    <div>
      <button onClick={() => count.set(count.get + 1)}>Increment</button>
      <span>Count: {count.get}</span>
    </div>
  )
}

// UserName.tsx
import { useFastContextFields } from './store'

export function UserName() {
  const { user } = useFastContextFields(['user'])

  return (
    <div>
      <input
        value={user.get.name}
        onChange={e => user.set({ ...user.get, name: e.target.value })}
      />
      <span>User: {user.get.name}</span>
    </div>
  )
}
 */
export default function createFastContext<FastContext>(initialState: FastContext) {
  function useFastContextData(): {
    get: () => FastContext;
    set: (value: Partial<FastContext>) => void;
    subscribe: (callback: () => void) => () => void;
  } {
    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set = useCallback((value: Partial<FastContext>) => {
      store.current = { ...store.current, ...value };
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  type UseFastContextDataReturnType = ReturnType<typeof useFastContextData>;

  const FastContext = createContext<UseFastContextDataReturnType | null>(null);

  function FastContextProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
      <FastContext.Provider value={useFastContextData()}>
        {children}
      </FastContext.Provider>
    );
  }

  function useFastContext<SelectorOutput>(
    selector: (store: FastContext) => SelectorOutput
  ): [SelectorOutput, (value: Partial<FastContext>) => void] {
    const fastContext = useContext(FastContext);
    if (!fastContext) {
      throw new Error("Store not found");
    }

    const state = useSyncExternalStore(
      fastContext.subscribe,
      () => selector(fastContext.get()),
      () => selector(initialState),
    );

    return [state, fastContext.set];
  }

  function useFastContextFields<T extends readonly (keyof FastContext)[]>(
    fieldNames: T
  ): { [K in T[number]]: { get: FastContext[K], set: (value: FastContext[K]) => void } } {
    const gettersAndSetters = {} as { [K in T[number]]: { get: FastContext[K], set: (value: FastContext[K]) => void } };
    for (const fieldName of fieldNames) {
      const [getter, setter] = useFastContext((fc) => fc[fieldName]);
      gettersAndSetters[fieldName] = { 
        get: getter, 
        set: (value: FastContext[typeof fieldName]) => setter({ [fieldName]: value } as Partial<FastContext>) 
      };
    }
    
    return gettersAndSetters;
  }

  return {
    FastContextProvider,
    useFastContextFields,
  };
}