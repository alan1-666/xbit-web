export class AdapterFactory {
  private adapterMap: Map<string, any>;

  constructor() {
    this.adapterMap = new Map<string, any>();
  }

  setAdapter(key: string, value: any): void {
    this.adapterMap.set(key, value);
  }

  getAdapter(key: string): any {
    return this.adapterMap.get(key);
  }

  deleteAdapter(key: string): void {
    const adapter = this.getAdapter(key);
    if (adapter && typeof adapter.remove === 'function') {
      adapter.remove();
    }
    this.adapterMap.delete(key);
  }

  hasAdapter(key: string): boolean {
    return this.adapterMap.has(key);
  }

  clearAdapter(): void {
    this.adapterMap.forEach((adapter) => {
      if (adapter && typeof adapter.remove === 'function') {
        adapter.remove();
      }
    });
    this.adapterMap.clear();
  }
}
