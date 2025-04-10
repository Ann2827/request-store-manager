import { Logger, type NamedLogger, StorageFactory } from '@core';

import type { IModule, TCacheOptions, TCacheSettings, TStorage } from '@types';

type TCacheObj = { expires: number; value: any };
function IsCacheObj(payload: unknown): payload is TCacheObj {
  return (
    !!payload &&
    typeof payload === 'object' &&
    'expires' in payload &&
    typeof payload.expires === 'number' &&
    'value' in payload
  );
}

export const MODULE_NAME = 'cache';

/**
 * Модуль для кэширования.
 * Без префикса: cache.setCacheItem('bar', ...) -> key: cache-bar
 * С префиксом 'foo': cache.setCacheItem('bar', ...) -> key: foo--cache-bar
 * С постфиксом 'post': cache.setCacheItem('bar', ...) -> key: cache-post-bar
 */
class Cache implements IModule {
  readonly #settings: TCacheSettings;

  readonly #namedLogger?: NamedLogger;

  #storage: StorageFactory;

  #getExpires(maxAge?: number): number {
    return maxAge ? new Date(Date.now() + 1000 * 60 * maxAge).getTime() : 0;
  }

  constructor(settings?: Partial<TCacheSettings>, logger?: Logger) {
    this.#settings = {
      prefix: settings?.prefix
        ? `${settings.prefix}--${MODULE_NAME}-`
        : `${MODULE_NAME}-` + (settings?.postfix ? `${settings.postfix}` : ''),
    };
    this.#namedLogger = logger?.named(MODULE_NAME);
    this.#storage = new StorageFactory();

    this.setCacheItem = this.setCacheItem.bind(this);
    this.getCacheItem = this.getCacheItem.bind(this);
    this.removeCacheItem = this.removeCacheItem.bind(this);
    this.restart = this.restart.bind(this);
  }

  public restart() {
    this.#storage = new StorageFactory();
  }

  /**
   * @param key - указать без префикса
   */
  public setCacheItem(key: string, value: string, options?: Partial<TCacheOptions>) {
    const storage = this.#storage.getInstance(options?.place);

    const expires = this.#getExpires(options?.maxAge);
    const itemData = JSON.stringify({ expires, value });
    const itemKey = this.#settings.prefix + key;

    storage.setItem(itemKey, itemData);

    this.#namedLogger?.message(
      `SetItem ${itemKey} in ${storage.name}`,
      (((itemKey.length + itemData.length) * 2) / 1024).toFixed(2) + ' KB',
    );
  }

  /**
   * @param key - указать без префикса
   */
  public getCacheItem(key: string, place?: TStorage): string | undefined {
    const storage = this.#storage.getInstance(place);

    const value: any = storage.getItem(this.#settings.prefix + key);
    let cache: string;
    try {
      if (typeof value !== 'string') return;
      const objValue = JSON.parse(value);
      if (!IsCacheObj(objValue)) return;
      if (objValue.expires > 0 && objValue.expires < Date.now()) {
        this.removeCacheItem(key);
        return;
      }
      cache = objValue.value;
    } catch {
      return;
    }
    return cache;
  }

  /**
   * Удаляет одну запись по ключу
   * @param key - указать без префикса
   */
  public removeCacheItem(key: string, place?: TStorage) {
    const storage = this.#storage.getInstance(place);
    const itemKey = this.#settings.prefix + key;
    storage.removeItem(itemKey);
    this.#namedLogger?.message(`RemoveItem ${itemKey}`);
  }
}

export default Cache;
