type FavoriteChangeListener = (tokenAddress: string, isFavorite: boolean) => void;

class FavoriteEventManager {
    private listeners: FavoriteChangeListener[] = [];

    addListener(listener: FavoriteChangeListener): void {
        this.listeners.push(listener);
    }

    removeListener(listener: FavoriteChangeListener): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    emitFavoriteChange(tokenAddress: string, isFavorite: boolean): void {
        this.listeners.forEach(listener => listener(tokenAddress, isFavorite));
    }
}

export const favoriteEvents = new FavoriteEventManager();
