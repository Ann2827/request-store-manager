import { Logger, type NamedLogger } from '@core';

import type { IModule, TCacheConfig, TCacheNames, TCacheOptions, TCacheSettings } from '@types';

import Cache from './Cache';

export const MODULE_NAME = 'cacheStrict';

/**
 * FIXME: Заместитель (почти)
 * Модуль работает только с ключами, указанными в конфиге.
 */
class CacheStrict<C extends TCacheNames> extends Cache implements IModule {
  readonly #config: TCacheConfig<C>;

  readonly #namedLogger?: NamedLogger;

  #getOptions(options: boolean | Partial<TCacheOptions>): Partial<TCacheOptions> {
    return {
      place: typeof options === 'boolean' ? undefined : options?.place,
      maxAge: typeof options === 'boolean' ? 0 : options?.maxAge,
    };
  }

  constructor(config: TCacheConfig<C>, settings?: Partial<TCacheSettings>, logger?: Logger) {
    super(settings, logger);

    this.#namedLogger = logger?.named(MODULE_NAME);
    this.#config = config;
  }

  public set(key: C, value: string) {
    const options = this.#config[key];
    if (!options) {
      this.#namedLogger?.warn(`Cache not set because ${key.toString()} not found in config.`);
      return;
    }

    super.setCacheItem(key.toString(), value, this.#getOptions(options));
  }

  public get(key: C): string | undefined {
    const options = this.#config[key];
    if (!options) {
      this.#namedLogger?.warn(`Cache is undefined because ${key.toString()} not found in config.`);
      return;
    }

    return super.getCacheItem(key.toString(), this.#getOptions(options).place);
  }

  public remove(key: C) {
    const options = this.#config[key];
    if (!options) {
      this.#namedLogger?.warn(`Cache not remove because ${key.toString()} not found in config.`);
      return;
    }

    super.removeCacheItem(key.toString(), this.#getOptions(options).place);
  }
}

export default CacheStrict;
