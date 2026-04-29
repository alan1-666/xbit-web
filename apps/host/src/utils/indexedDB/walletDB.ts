import { openDB } from 'idb';

export interface XWalletFavourite {
  id: string;
  address: string;
  alias: string;
}

const DB_NAME = 'xbit-db';
const STORE_NAME = {
  WALLET_FAVOURITE: 'wallet-favourite',
};

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME.WALLET_FAVOURITE)) {
        db.createObjectStore(STORE_NAME.WALLET_FAVOURITE);
      }
    },
  });
}
