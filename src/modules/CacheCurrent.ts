import { Logger } from '@core';

import type { IModule, TCacheConfig, TCacheNames, TCacheOptions, TCacheSettings } from '@types';

import CacheStrict from './CacheStrict';

export const MODULE_NAME = 'cacheCurrent';

/**
 * Модуль для работы с CacheCurrent
 */
class CacheCurrent<C extends TCacheNames> extends CacheStrict<C> implements IModule {
  readonly #name: C;

  constructor(name: C, config: Partial<TCacheOptions>, settings?: Partial<TCacheSettings>, logger?: Logger) {
    const cacheStrictConfig = { [name]: config } as TCacheConfig<C>;
    super(cacheStrictConfig, settings, logger);

    this.#name = name;
  }

  public set(value: any) {
    super.set(this.#name, value);
  }

  public get(): string | undefined {
    return super.get(this.#name);
  }

  public remove() {
    super.remove(this.#name);
  }
}

export default CacheCurrent;
