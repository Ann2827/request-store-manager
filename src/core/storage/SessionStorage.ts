import type { IStorageBase, TStorage } from '@types';

class SessionStorage implements IStorageBase {
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
    return 'sessionStorage';
  }

  public check(): boolean {
    if (typeof this.#available === 'boolean') return this.#available;

    let check = false;
    try {
      check =
        'sessionStorage' in globalThis &&
        typeof globalThis.sessionStorage.getItem === 'function' &&
        typeof globalThis.sessionStorage.setItem === 'function';
    } catch {
      check = false;
    }

    this.#available = check;
    return check;
  }

  getItem(key: string): string | null {
    if (!this.check()) return null;
    return globalThis.sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.check()) return;
    globalThis.sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (!this.check()) return;
    globalThis.sessionStorage.removeItem(key);
  }

  getKeys(): string[] {
    if (!this.check()) return [];
    return Object.keys(globalThis.sessionStorage);
  }
}

export default SessionStorage;
