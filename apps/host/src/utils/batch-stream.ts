export type BatchStream<T> = {
  next: (item: T) => void
  nextItems: (items: T[]) => void // for batch processing
  subscribe: (handler: (batch: T[]) => void) => () => void // return unsubscribe fn
  dispose: () => void // stop interval, cleanup
}

export function createBatchStream<T>({ timeWindow, maxSize }: { timeWindow: number; maxSize: number }): BatchStream<T> {
  let queue: T[] = []
  let subscribers: Array<(batch: T[]) => void> = []

  const intervalId = setInterval(() => {
    if (queue.length > 0) {
      flush()
    }
  }, timeWindow)

  function flush() {
    const batch = queue.splice(0, maxSize)
    if (batch.length > 0) {
      subscribers.forEach((fn) => fn(batch))
    }
  }

  return {
    next(item: T) {
      queue.push(item)
      if (queue.length >= maxSize) {
        flush()
      }
    },

    nextItems(items: T[]) {
      queue.push(...items)
      if (queue.length >= maxSize) {
        flush()
      }
    },

    subscribe(handler: (batch: T[]) => void) {
      subscribers.push(handler)
      // Return unsubscribe function
      return () => {
        subscribers = subscribers.filter((fn) => fn !== handler)
      }
    },

    dispose() {
      clearInterval(intervalId)
      subscribers = []
      queue = []
    },
  }
}
