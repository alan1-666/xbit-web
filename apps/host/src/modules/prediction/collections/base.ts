// collection.ts
import {
  type QueryKey,
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import React from 'react'

/* ======================================================
 * Types
 * ====================================================== */

/**
 * Collection-level query options.
 * This is a thin wrapper around TanStack Query's UseQueryOptions.
 *
 * We intentionally reuse TanStack Query types to:
 * - keep type compatibility
 * - reduce cognitive overhead
 * - make future upgrades easier
 */
export type CollectionQueryOptions<TQueryFnData, TError = unknown, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
  'queryKey'
> &
  Pick<UseQueryOptions<TQueryFnData, TError, TData, QueryKey>, 'queryFn' | 'enabled' | 'staleTime' | 'select'> & {
    queryKey: () => QueryKey
  }

/**
 * Collection-level mutation options with custom callbacks.
 * Extended from TanStack Query's UseMutationOptions but with custom signatures
 * to support queryClient access and proper context typing.
 */
export type CollectionMutationOptions<TData = unknown, TError = unknown, TVariables = void, TQueryFnData = unknown> = {
  mutationKey?: UseMutationOptions['mutationKey']
  mutationFn: (variables: TVariables) => Promise<TData>
  onMutate?: (
    variables: TVariables,
    context: { previousData?: TQueryFnData },
  ) => TQueryFnData | void | Promise<TQueryFnData | void>
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: { previousData?: TQueryFnData },
    queryClient: ReturnType<typeof useQueryClient>,
  ) => void | Promise<void>
  onError?: (
    error: TError,
    variables: TVariables,
    context: { previousData?: TQueryFnData } | undefined,
    queryClient: ReturnType<typeof useQueryClient>,
  ) => void | Promise<void>
}

/**
 * A Collection represents a single source of truth
 * for a list (or entity set) in the application.
 *
 * - query describes how data is fetched
 * - mutations describe how data is modified
 */
export type Collection<
  TQueryFnData,
  TError = unknown,
  TMutations extends Record<string, CollectionMutationOptions<any, TError, any, TQueryFnData>> = Record<
    string,
    CollectionMutationOptions<any, TError, any, TQueryFnData>
  >,
> = CollectionQueryOptions<TQueryFnData, TError> & {
  mutations: TMutations
}

/* ======================================================
 * Type inference helpers
 * ====================================================== */

/**
 * Infer the query data type from a collection
 */
export type InferQueryData<T> = T extends Collection<infer TQueryFnData, any, any> ? TQueryFnData : never

/**
 * Infer the error type from a collection
 */
export type InferError<T> = T extends Collection<any, infer TError, any> ? TError : never

/**
 * Infer mutation variable type from a collection's specific mutation
 */
export type InferMutationVariables<T extends Collection<any, any, any>, K extends keyof T['mutations']> =
  T['mutations'][K] extends CollectionMutationOptions<any, any, infer TVariables, any> ? TVariables : never

/**
 * Infer mutation data type from a collection's specific mutation
 */
export type InferMutationData<T extends Collection<any, any, any>, K extends keyof T['mutations']> =
  T['mutations'][K] extends CollectionMutationOptions<infer TData, any, any, any> ? TData : never

/* ======================================================
 * createCollection
 * ====================================================== */

/**
 * Creates a collection definition with full type inference.
 *
 * This function does NOT execute anything.
 * It only defines how the collection behaves.
 *
 * @example
 * const todos = createCollection({
 *   queryKey: () => ['todos'],
 *   queryFn: async () => fetchTodos(),
 *   mutations: {
 *     add: {
 *       mutationFn: async (todo: NewTodo) => addTodo(todo),
 *       onSuccess: (data, variables, context, queryClient) => {
 *         // data, variables are fully typed
 *       }
 *     }
 *   }
 * })
 *
 * // Usage automatically infers types:
 * const { data } = useCollectionQuery({ collection: todos })
 * const { mutate } = useCollectionMutation({ collection: todos, mutation: 'add' })
 */
export function createCollection<
  TQueryFnData,
  TError = unknown,
  TMutations extends Record<string, CollectionMutationOptions<any, TError, any, TQueryFnData>> = Record<
    string,
    CollectionMutationOptions<any, TError, any, TQueryFnData>
  >,
>(config: Collection<TQueryFnData, TError, TMutations>) {
  return config
}

/* ======================================================
 * useCollectionQuery
 * ====================================================== */

/**
 * Hook for reading collection data.
 *
 * Internally, this is just a thin wrapper around useQuery.
 * The component does not need to know anything about
 * TanStack Query directly.
 */
export function useCollectionQuery<TQueryFnData, TError = unknown, TData = TQueryFnData>({
  collection,
}: {
  collection: Collection<TQueryFnData, TError>
}) {
  return useQuery<TQueryFnData, TError, TData>({
    queryKey: collection.queryKey(),
    queryFn: collection.queryFn,
    enabled: collection.enabled,
    staleTime: collection.staleTime,
    select: collection.select as ((data: TQueryFnData) => TData) | undefined,
  })
}

/* ======================================================
 * useCollectionMutation
 * ====================================================== */

/**
 * Hook for executing a mutation defined on a collection.
 *
 * This hook:
 * - automatically cancels ongoing queries
 * - captures previous cache state for rollback
 * - delegates optimistic logic to the collection
 * - fully infers types from the collection and mutation key
 *
 * @example
 * const { mutate, mutateAsync } = useCollectionMutation({
 *   collection: todos,
 *   mutation: 'add' // autocomplete available
 * })
 *
 * mutate(newTodo) // newTodo type is inferred
 */
export function useCollectionMutation<
  TCollection extends Collection<any, any, any>,
  TMutationKey extends keyof TCollection['mutations'],
>({ collection, mutation }: { collection: TCollection; mutation: TMutationKey }) {
  const queryClient = useQueryClient()

  type TQueryFnData = InferQueryData<TCollection>
  type TError = InferError<TCollection>
  type TData = InferMutationData<TCollection, TMutationKey>
  type TVariables = InferMutationVariables<TCollection, TMutationKey>

  const mutationConfig = collection.mutations[mutation] as CollectionMutationOptions<
    TData,
    TError,
    TVariables,
    TQueryFnData
  >

  return useMutation<TData, TError, TVariables, { previousData?: TQueryFnData }>({
    mutationKey: mutationConfig.mutationKey,
    mutationFn: mutationConfig.mutationFn,

    /**
     * Runs before the mutation function.
     * Used mainly for optimistic updates.
     */
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({
        queryKey: collection.queryKey(),
      })

      // Snapshot the current cache state
      const previousData = queryClient.getQueryData<TQueryFnData>(collection.queryKey())

      // Delegate optimistic update logic to the collection
      const optimisticData = await mutationConfig.onMutate?.(variables, { previousData })

      // If the collection returns optimistic data, apply it to the cache
      if (optimisticData !== undefined) {
        queryClient.setQueryData(collection.queryKey(), optimisticData)
      }

      // The returned context will be available in onError / onSuccess
      return { previousData }
    },

    /**
     * Runs when the mutation succeeds.
     * The collection can optionally update the cache here.
     */
    onSuccess: (data: TData, variables: TVariables, context: { previousData?: TQueryFnData }) => {
      mutationConfig.onSuccess?.(data, variables, context, queryClient)
    },

    /**
     * Runs when the mutation fails.
     * Automatically rolls back to the previous cache state
     * unless the collection overrides this behavior.
     */
    onError: (error: TError, variables: TVariables, context: { previousData?: TQueryFnData } | undefined) => {
      mutationConfig.onError?.(error, variables, context, queryClient)

      // Default rollback behavior
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(collection.queryKey(), context.previousData)
      }
    },
  })
}

/* ======================================================
 * Collection Registry
 * ====================================================== */

/**
 * Global registry to cache collection instances by queryKey.
 * This ensures that multiple components using the same queryKey
 * will share the exact same collection instance.
 */
const collectionRegistry = new Map<string, Collection<any, any, any>>()

/**
 * Get or create a collection instance from the registry.
 * If a collection with the same queryKey already exists, return it.
 * Otherwise, create a new one and cache it.
 */
function getOrCreateCollection<
  TQueryFnData,
  TError = unknown,
  TMutations extends Record<string, CollectionMutationOptions<any, TError, any, TQueryFnData>> = Record<
    string,
    CollectionMutationOptions<any, TError, any, TQueryFnData>
  >,
>(
  factory: () => Collection<TQueryFnData, TError, TMutations>,
  queryKeyString: string,
): Collection<TQueryFnData, TError, TMutations> {
  // Check if collection already exists in registry
  if (collectionRegistry.has(queryKeyString)) {
    return collectionRegistry.get(queryKeyString) as Collection<TQueryFnData, TError, TMutations>
  }

  // Create new collection instance
  const collection = factory()

  // Cache it in the registry
  collectionRegistry.set(queryKeyString, collection)

  return collection
}

/**
 * Clear all cached collection instances from the registry.
 * Useful for cleanup (e.g., on logout) or testing.
 *
 * @example
 * // Clear all collections on logout
 * function logout() {
 *   clearCollectionRegistry()
 *   queryClient.clear()
 * }
 */
export function clearCollectionRegistry() {
  collectionRegistry.clear()
}

/* ======================================================
 * useCollection
 * ====================================================== */

/**
 * Hook that creates a collection instance with dynamic queryKey.
 * This allows you to create parameterized collections.
 *
 * The hook uses a global registry to cache collection instances based on their queryKey.
 * If multiple components use the same queryKey, they will share the exact same
 * collection instance, improving performance and ensuring consistency.
 *
 * @example
 * // Component A
 * function ComponentA() {
 *   const eventCollection = useCollection(() => createEventCollection('event-123'))
 *   // Creates instance and stores in registry
 * }
 *
 * // Component B (different component tree)
 * function ComponentB() {
 *   const eventCollection = useCollection(() => createEventCollection('event-123'))
 *   // ✅ Returns the SAME instance from registry (same queryKey)
 *   // ✅ eventCollectionA === eventCollectionB (same object reference)
 * }
 *
 * // Component C
 * function ComponentC() {
 *   const eventCollection = useCollection(() => createEventCollection('event-456'))
 *   // Creates NEW instance (different queryKey)
 * }
 */
export function useCollection<
  TQueryFnData,
  TError = unknown,
  TMutations extends Record<string, CollectionMutationOptions<any, TError, any, TQueryFnData>> = Record<
    string,
    CollectionMutationOptions<any, TError, any, TQueryFnData>
  >,
>(factory: () => Collection<TQueryFnData, TError, TMutations>): Collection<TQueryFnData, TError, TMutations> {
  // Create the collection to get its queryKey
  const collection = factory()

  // Generate a stable key from the queryKey
  const queryKey = collection.queryKey()
  const queryKeyString = JSON.stringify(queryKey)

  // Get or create collection from global registry
  // This ensures all components with the same queryKey share the same instance

  return React.useMemo(() => getOrCreateCollection(factory, queryKeyString), [queryKeyString])
}

/* ======================================================
 * Example usage
 * ====================================================== */

// interface Todo {
//   id: string
//   title: string
// }

// interface NewTodo {
//   title: string
// }

// const todosCollection = createCollection({
//   queryKey: () => ['todos'] as const,
//   queryFn: async (): Promise<Todo[]> => {
//     const response = await fetch('/api/todos')
//     return response.json()
//   },

//   mutations: {
//     add: {
//       mutationKey: ['todos', 'add'] as const,
//       mutationFn: async (newTodo: NewTodo): Promise<Todo> => {
//         const response = await fetch('/api/todos', {
//           method: 'POST',
//           body: JSON.stringify(newTodo),
//         })
//         return response.json()
//       },

//       onMutate: async (variables, context) => {
//         // variables is typed as NewTodo
//         // context.previousData is typed as Todo[] | undefined
//       },

//       onSuccess: (data, variables, context, queryClient) => {
//         // data is typed as Todo
//         // variables is typed as NewTodo
//         // context.previousData is typed as Todo[] | undefined
//         // queryClient is fully typed
//       },
//     },

//     remove: {
//       mutationKey: ['todos', 'remove'] as const,
//       mutationFn: async (id: string): Promise<void> => {
//         await fetch(`/api/todos/${id}`, { method: 'DELETE' })
//       },

//       onSuccess: (data, variables, context, queryClient) => {
//         // data is typed as void
//         // variables is typed as string
//       },
//     },
//   },
// })

// // Usage in components:
// function TodoList() {
//   // data is inferred as Todo[] | undefined
//   const { data } = useCollectionQuery({ collection: todosCollection })

//   // mutate accepts NewTodo, mutateAsync returns Promise<Todo>
//   const { mutate, mutateAsync } = useCollectionMutation({
//     collection: todosCollection,
//     mutation: 'add', // autocomplete available: 'add' | 'remove'
//   })

//   // removeTodo accepts string, mutateAsync returns Promise<void>
//   const { mutate: removeTodo } = useCollectionMutation({
//     collection: todosCollection,
//     mutation: 'remove',
//   })

//   return (
//     <div>
//       {data?.map(todo => (
//         <div key={todo.id}>
//           {todo.title}
//           <button onClick={() => removeTodo(todo.id)}>Delete</button>
//         </div>
//       ))}
//     </div>
//   )
// }

// // Dynamic collection with useCollection:
// const createUserTodosCollection = (userId: string) =>
//   createCollection({
//     queryKey: () => ['todos', userId] as const,
//     queryFn: async (): Promise<Todo[]> => {
//       const response = await fetch(`/api/users/${userId}/todos`)
//       return response.json()
//     },

//     mutations: {
//       add: {
//         mutationKey: ['todos', 'add'] as const,
//         mutationFn: async (newTodo: NewTodo): Promise<Todo> => {
//           const response = await fetch(`/api/users/${userId}/todos`, {
//             method: 'POST',
//             body: JSON.stringify(newTodo),
//           })
//           return response.json()
//         },
//       },

//       remove: {
//         mutationKey: ['todos', 'remove'] as const,
//         mutationFn: async (id: string): Promise<void> => {
//           await fetch(`/api/users/${userId}/todos/${id}`, { method: 'DELETE' })
//         },
//       },
//     },
//   })

// function UserTodoList({ userId }: { userId: string }) {
//   // Create a collection instance for this specific user
//   const userTodos = useCollection(() => createUserTodosCollection(userId))

//   // Now use it with other hooks
//   const { data, isLoading } = useCollectionQuery({ collection: userTodos })
//   const { mutate: addTodo } = useCollectionMutation({ collection: userTodos, mutation: 'add' })
//   const { mutate: removeTodo } = useCollectionMutation({ collection: userTodos, mutation: 'remove' })

//   if (isLoading) return <div>Loading...</div>

//   return (
//     <div>
//       <button onClick={() => addTodo({ title: 'New Todo' })}>Add Todo</button>

//       {data?.map((todo) => (
//         <div key={todo.id}>
//           {todo.title}
//           <button onClick={() => removeTodo(todo.id)}>Delete</button>
//         </div>
//       ))}
//     </div>
//   )
// }
