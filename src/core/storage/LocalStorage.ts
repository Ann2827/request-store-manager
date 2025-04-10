import type { IStorageBase, TStorage } from '@types';

class LocalStorage implements IStorageBase {
  #available: boolean;

  constructor() {
    this.#available = this.check();

    this.check = this.check.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.getKeys = this.getKeys.bind(this);
  }

  public get name(): TStorage {
    return 'localStorage';
  }

  public check(): boolean {
    if (typeof this.#available === 'boolean') return this.#available;

    let check = false;
    try {
      check =
        'localStorage' in globalThis &&
        typeof globalThis.localStorage.getItem === 'function' &&
        typeof globalThis.localStorage.setItem === 'function';
    } catch {
      check = false;
    }

    this.#available = check;
    return check;
  }

  public getItem(key: string): string | null {
    if (!this.check()) return null;
    return globalThis.localStorage.getItem(key);
  }

  public setItem(key: string, value: string): void {
    if (!this.check()) return;
    globalThis.localStorage.setItem(key, value);
  }

  public removeItem(key: string): void {
    if (!this.check()) return;
    globalThis.localStorage.removeItem(key);
  }

  public getKeys(): string[] {
    if (!this.check()) return [];
    return Object.keys(globalThis.localStorage);
  }
}

export default LocalStorage;
