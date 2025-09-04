import { Context, Logger, NamedLogger } from '@core';
import { fillObject } from '@utils';

import type { IModule, TStoreBase, TStoreConfig, TStoreEmptyFn, TStoreSettings, TStoreValidationFn } from '@types';

import CacheStrict from './CacheStrict';
import CacheCurrent from './CacheCurrent';

export type TStateModules<C extends keyof Partial<TStoreBase>> = {
  /**
   * Если необходимо кэшировать часть данных, то небходимо указать ключи при инициализации класса кэша и передать его instance через модули.
   */
  cache?: CacheStrict<C>;
  cacheFull?: CacheCurrent<C>;
};

export const MODULE_NAME = 'store';

/**
 * Хранилище с возможностью подписаться на изменения, валидацией и кэшированием.
 */
class Store<S extends TStoreBase> extends Context<S> implements IModule {
  readonly #validation: { [K in keyof S]: TStoreValidationFn<S[K]> };
  // readonly #validation: Record<keyof S, TStoreValidationFn<S[keyof S]>>;
  readonly #validationFull: TStoreValidationFn<S>;

  readonly #isEmpty: { [K in keyof S]: TStoreEmptyFn<S[K]> };

  readonly #modules: TStateModules<keyof Partial<S>>;

  readonly #namedLogger?: NamedLogger;

  #restored: boolean = false;

  #validate<K extends keyof S>(fn: TStoreValidationFn<S[K]>, key: K, value: unknown): value is S[K] {
    const valid = fn?.(value) ?? true;
    if (!valid) this.#namedLogger?.error(`Validation state: ${key.toString()} not valid`);
    return valid;
  }

  #validateFull(fn: TStoreValidationFn<S>, value: unknown): value is S {
    const valid = fn?.(value) ?? true;
    if (!valid) this.#namedLogger?.error(`Validation state: full not valid`);
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
      (_, key) => config.validation?.[key] || ((d: unknown, _r?: Response): d is S[typeof key] => true),
    );
    const filledEmpty = fillObject<S, { [K in keyof S]: TStoreEmptyFn<S[K]> }>(
      config.initialState,
      (_, key) => config?.isEmpty?.[key] || ((value: S[typeof key]): boolean => !value),
    );

    const name = settings?.name || MODULE_NAME;
    const namedLogger = logger?.named(name);
    super(config.initialState, namedLogger);

    Object.entries(config.initialState).forEach(([key, value]) => {
      if (filledEmpty[key](value as S[typeof key])) return;
      this.#validate(filledValidation[key], key, value);
    });

    this.#validation = filledValidation;
    this.#validationFull = config?.validationFull || ((d: unknown, _r?: Response): d is S => true);
    this.#isEmpty = filledEmpty;
    this.#modules = { ...modules };
    this.#namedLogger = namedLogger;

    this.getFull = this.getFull.bind(this);
  }

  public restart() {
    // TODO: нужно ли это делать? При общем использовании и при частичном
    Object.values(this.#modules).forEach((module) => module?.restart());
    super.restart();
  }

  public set<K extends keyof S = keyof S>(key: K, fn: (prev: S[K]) => S[K]): void {
    const value: S[K] = fn(super.state[key]);
    if (!this.#validate<K>(this.#validation[key], key, value)) return;
    super.setState((prev) => ({ ...prev, [key]: value }));

    if (this.isEmpty(key, value)) {
      this.#modules.cache?.remove(key.toString());
      return;
    }

    this.#modules.cache?.set(key.toString(), value);
  }

  public setFull(fn: (prev: S) => S): void {
    const value: S = fn(super.state);
    if (!this.#validateFull(this.#validationFull, value)) return;
    super.setState((prev) => ({ ...prev, ...value }));
    this.#modules.cacheFull?.set(value);
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
      this.set(key, () => cacheValue);
      return cacheValue;
    }

    this.#modules.cache?.remove(key);
    return value;
  }

  public getFull(): S {
    const value = super.state;
    if (this.#restored) return value;

    const cacheValue = this.#modules.cacheFull?.get();
    if (cacheValue === undefined) return value;
    if (this.#validateFull(this.#validationFull, cacheValue)) {
      this.#namedLogger?.message(`full state restored from cache.`);
      this.#restored = true;
      this.setFull(() => cacheValue);
      return cacheValue;
    }

    this.#modules.cacheFull?.remove();
    return value;
  }
}

export default Store;
