export interface EventData {
    eventName?: string;
    message?: string;
    data?: any;
  }
  
  // 维护 callback 与实际监听函数的映射，便于准确移除
  const listeners = new Map<string, Map<Function, EventListener>>()
  
  const eventBus = {
    on(event: string, callback?: any) {
      if (!callback) return;
      const listener: EventListener = (e: Event) => {
        const ce = e as CustomEvent;
        callback(ce.detail);
      };
      document.addEventListener(event, listener);
      let map = listeners.get(event);
      if (!map) {
        map = new Map();
        listeners.set(event, map);
      }
      map.set(callback, listener);
    },
    dispatch(event: string, data?: EventData) {
      document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    remove(event: string, callback?: any) {
      const map = listeners.get(event);
      if (!map) return;
      if (!callback) return; // 与历史用法保持一致：不传 callback 不做任何移除
      const listener = map.get(callback);
      if (listener) {
        document.removeEventListener(event, listener);
        map.delete(callback);
        if (map.size === 0) listeners.delete(event);
      }
    },
  };
  
  export default eventBus;
  