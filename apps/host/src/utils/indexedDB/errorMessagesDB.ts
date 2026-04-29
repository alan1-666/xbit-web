const DB_NAME = 'ErrorMessagesDB';
const STORE_NAME = 'cache-error-msg';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveToIndexedDB = async (key: string, data: any, ttlMinutes = 30): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const expiry = Date.now() + ttlMinutes * 60 * 1000;
  store.put({ key, data, expiry });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getFromIndexedDB = async <T = any>(key: string): Promise<T | null> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      const record = request.result;
      if (!record) return resolve(null);

      if (Date.now() > record.expiry) {
        const deleteTx = db.transaction(STORE_NAME, 'readwrite');
        deleteTx.objectStore(STORE_NAME).delete(key);
        deleteTx.oncomplete = () => resolve(null);
        deleteTx.onerror = () => reject(deleteTx.error);
      } else {
        resolve(record.data as T);
      }
    };
    request.onerror = () => reject(request.error);
  });
};
