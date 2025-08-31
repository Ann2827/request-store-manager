import { fillObject } from '@utils';
import { Logger, NamedLogger } from '@core';
import { NeedsActionTypes } from '@types';

import type {
  IModule,
  INeedsConfig,
  THttpsBase,
  TNeedsBase,
  TNeedsItem,
  TNotificationsBase,
  TStoreBase,
  TTokenNames,
} from '@types';

import Store from './Store';
import Https from './Https';

export type TNeedsModules<
  T extends TTokenNames,
  H extends THttpsBase<T>,
  S extends TStoreBase,
  N extends TNotificationsBase,
> = {
  https: Https<T, H, N>;
  store: Store<S>;
};

export const MODULE_NAME = 'needs';

class Needs<
    T extends TTokenNames,
    S extends TStoreBase,
    H extends THttpsBase<T>,
    N extends TNotificationsBase,
    L extends TNeedsBase<T, S, H>,
  >
  extends Store<Record<keyof S, null | boolean>>
  implements IModule
{
  readonly #config: {
    [K in keyof S]: Required<TNeedsItem<T, H, S[K]>>;
  };

  readonly #revertMap: { [K in keyof H]?: keyof S };

  readonly #modules: TNeedsModules<T, H, S, N>;

  // readonly #settings: TNeedsSettings;

  readonly #namedLogger?: NamedLogger;

  constructor(config: INeedsConfig<T, H, S>, modules: TNeedsModules<T, H, S, N>, logger?: Logger) {
    const store = fillObject<S, Record<keyof S, null>>(modules.store.state, () => null);
    super({ initialState: store }, {}, { name: MODULE_NAME }, logger);
    // this.#settings = config.settings;
    this.#modules = modules;
    this.#config = fillObject<INeedsConfig<T, H, S>, { [K in keyof S]: Required<TNeedsItem<T, H, S[K]>> }>(
      config,
      (value, key) => ({
        requestName: value.requestName,
        converter: value.converter ?? (({ validData }) => validData as S[typeof key]),
      }),
    );
    this.#revertMap = Object.fromEntries(
      Object.entries(config).map<[keyof H, keyof S]>(
        ([key, value]: [keyof S, Required<TNeedsItem<T, H, S[keyof S]>>]) => [value.requestName, key],
      ),
    ) as unknown as { [K in keyof H]?: keyof S };
    this.#namedLogger = logger?.named(MODULE_NAME);
  }

  public restart(): void {
    super.restart();
    Object.values(this.#modules).forEach((module) => module.restart()); // TODO: нужно ли это делать? При общем использовании и при частичном
  }

  public updateStateByRequestName(requestName: keyof H) {
    const name = this.#revertMap[requestName];
    if (!name) return;

    const value = this.#modules.store.get(name);
    super.set(name, () => !this.#modules.store.isEmpty(name, value));
  }

  public async action<Name extends keyof S = keyof S>(
    name: Name,
    type: NeedsActionTypes = NeedsActionTypes.request,
    ...args: Parameters<L[Name] extends keyof H ? H[L[Name]][0] : () => void>
  ): Promise<void> {
    const status = super.get(name);
    if (status !== null && type === NeedsActionTypes.request) return;

    if (type === NeedsActionTypes.request) {
      const cacheData = this.#modules.store.get(name);
      if (cacheData && !this.#modules.store.isEmpty(name, cacheData)) {
        super.set(name, () => true);
        this.#namedLogger?.message(`${name.toString()} restored from cache.`);
        return;
      }
    }

    const { validData } = await this.#modules.https.namedRequest(this.#config[name].requestName, ...args);

    if (validData) {
      super.set(name, () => true);
      this.#modules.store.set(name, (prev) => this.#config[name].converter({ state: prev, validData }));
    } else {
      // this.#modules.store.set(name, () => null);
      super.set(name, () => false);
    }
  }
}

export default Needs;
