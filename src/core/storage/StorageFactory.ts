import type { IStorageBase, TStorage } from '@types';

import LocalStorage from './LocalStorage';
import SessionStorage from './SessionStorage';

const DEFAULT: TStorage = 'localStorage';
const PRIORITY: TStorage[] = ['localStorage', 'sessionStorage'];

/**
 * Организовывает работу со всеми известными хранилищами.
 */
class StorageFactory {
  #prefer: TStorage;

  #instances: Record<TStorage, IStorageBase>;

  constructor() {
    this.#instances = {
      localStorage: new LocalStorage(),
      sessionStorage: new SessionStorage(),
    };
    this.#prefer = PRIORITY.find((item) => this.#instances[item].check()) || DEFAULT;

    this.getInstance = this.getInstance.bind(this);
    this.reset = this.reset.bind(this);
  }

  public getInstance(name?: TStorage) {
    return name ? this.#instances[name] : this.#instances[this.#prefer];
  }

  /**
   * Очищает все известные хранилища по префиксу
   */
  public reset(prefix: string = '') {
    Object.values(this.#instances).forEach((storage) => {
      storage
        ?.getKeys()
        .filter((i) => i.startsWith(prefix))
        .forEach((key) => {
          storage?.removeItem(key);
        });
    });

    this.#instances = {
      localStorage: new LocalStorage(),
      sessionStorage: new SessionStorage(),
    };
  }
}

export default StorageFactory;
