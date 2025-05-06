import { Logger, type NamedLogger } from '@core';

import type {
  IHttpsRequest,
  IModule,
  TConserveBase,
  TConserveConfig,
  THttpsBase,
  TStoreBase,
  TTokenNames,
} from '@types';

import Store from './Store';

export type TConserveModules<S extends TStoreBase> = {
  store: Store<S>;
};

export const MODULE_NAME = 'conserve';

/**
 * Модуль для конвертации валидных https ответов в формат store и сохранения
 */
class Conserve<T extends TTokenNames, H extends THttpsBase<T>, S extends TStoreBase, C extends TConserveBase<T, H, S>>
  implements IModule
{
  readonly #config: TConserveConfig<T, H, S, C>;

  readonly #modules: TConserveModules<S>;

  readonly #namedLogger?: NamedLogger;

  constructor(config: TConserveConfig<T, H, S, C>, modules: TConserveModules<S>, logger?: Logger) {
    this.#config = { ...config };
    this.#modules = { ...modules };
    this.#namedLogger = logger?.named(MODULE_NAME);
  }

  public restart() {
    Object.values(this.#modules).forEach((module) => module.restart());
    this.#namedLogger?.restart();
  }

  public save<Name extends keyof H>(requestName: Name, validData: H[Name][1], fetchData: IHttpsRequest<T>) {
    const config = this.#config[requestName];
    if (!config) return;

    this.#modules.store.set(config.storeKey, (prev) => {
      if (!config.converter) return validData as unknown as typeof prev;

      const converted = config.converter({ state: prev, validData, fetchData });
      this.#namedLogger?.message(`Valid response from request: ${requestName.toString()} was converted`);
      return converted;
    });
  }
}

export default Conserve;
