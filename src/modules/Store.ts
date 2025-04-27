import { Context, Logger, NamedLogger } from '@core';
import { fillObject } from '@utils';

import type { IModule, TStoreBase, TStoreConfig, TStoreEmptyFn, TStoreSettings, TStoreValidationFn } from '@types';

import CacheStrict from './CacheStrict';

export type TStateModules<C extends keyof Partial<TStoreBase>> = {
  /**
   * Если необходимо кэшировать часть данных, то небходимо указать ключи при инициализации класса кэша и передать его instance через модули.
   */
  cache?: CacheStrict<C>;
};

export const MODULE_NAME = 'store';

/**
 * Хранилище с возможностью подписаться на изменения, валидацией и кэшированием.
 */
class Store<S extends TStoreBase> extends Context<S> implements IModule {
  readonly #validation: { [K in keyof S]: TStoreValidationFn<S[K]> };
  // readonly #validation: Record<keyof S, TStoreValidationFn<S[keyof S]>>;

  readonly #isEmpty: { [K in keyof S]: TStoreEmptyFn<S[K]> };

  readonly #modules: TStateModules<keyof Partial<S>>;

  readonly #namedLogger?: NamedLogger;

  #validate<K extends keyof S>(fn: TStoreValidationFn<S[K]>, key: K, value: unknown): value is S[K] {
    const valid = fn?.(value) ?? true;
    if (!valid) this.#namedLogger?.error(`Validation state: ${key.toString()} not valid`);
    return valid;
  }

  constructor(
    config: TStoreConfig<S>,
    modules?: TStateModules<keyof S>,
    settings?: Partial<TStoreSettings>,
    logger?: Logger,
  ) {
    const filledValidation = fillObject<S, { [K in keyof S]: TStoreValidationFn<S[K]> }>(
      config.initialState,
      (_, key) => config?.validation?.[key] || ((d: unknown, _r?: Response): d is S[typeof key] => true),
    );
    const filledEmpty = fillObject<S, { [K in keyof S]: TStoreEmptyFn<S[K]> }>(
      config.initialState,
      (_, key) => config?.isEmpty?.[key] || ((value: S[typeof key]): boolean => !value),
    );

    const name = settings?.name || MODULE_NAME;
    const namedLogger = logger?.named(name);
    super(config.initialState, namedLogger);

    Object.entries(config.initialState).forEach(([key, value]) => {
      this.#validate(filledValidation[key], key, value);
    });

    this.#validation = filledValidation;
    this.#isEmpty = filledEmpty;
    this.#modules = { ...modules };
    this.#namedLogger = namedLogger;
  }

  public restart() {
    super.restart();
    // TODO: нужно ли это делать? При общем использовании и при частичном
    Object.values(this.#modules).forEach((module) => module.restart());
  }

  public set<K extends keyof S = keyof S>(key: K, fn: (prev: S[K]) => S[K]): void {
    const value: S[K] = fn(super.state[key]);
    if (!this.#validate<K>(this.#validation[key], key, value)) return;
    super.setState((prev) => ({ ...prev, [key]: value }));

    if (!value) {
      this.#modules.cache?.remove(key.toString());
      return;
    }

    this.#modules.cache?.set(key.toString(), value.toString());
  }

  public isEmpty<K extends keyof S = keyof S>(key: K, value: S[K]): boolean {
    return this.#isEmpty[key](value);
  }

  public get<K extends keyof S = keyof S>(key: K): S[K] {
    const value = super.state[key];
    if (!this.isEmpty(key, value)) return value;

    const cacheValue = this.#modules.cache?.get(key);
    if (cacheValue === undefined) return value;
    if (this.#validate<K>(this.#validation[key], key, cacheValue)) {
      this.#namedLogger?.message(`${key.toString()} restored from cache.`);
      return cacheValue;
    }

    this.#modules.cache?.remove(key);
    return value;
  }
}

export default Store;
