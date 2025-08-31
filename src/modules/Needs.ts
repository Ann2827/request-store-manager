import { fillObject } from '@utils';
import { Logger, NamedLogger } from '@core';
import { NeedsActionTypes } from '@types';

import type {
  IModule,
  TConserveBase,
  THttpsBase,
  TNeedsBase,
  TNotificationsBase,
  TStoreBase,
  TTokenNames,
} from '@types';

import Store from './Store';
import Https from './Https';
import Conserve from './Conserve';

export type TNeedsModules<
  T extends TTokenNames,
  H extends THttpsBase<T>,
  S extends TStoreBase,
  N extends TNotificationsBase,
  C extends TConserveBase<T, H, S>,
> = {
  https: Https<T, H, N>;
  store: Store<S>;
  conserve: Conserve<T, H, S, C>;
};

export const MODULE_NAME = 'needs';

// TODO: выгружать из памяти (хранилища) неиспользуемые данные

class Needs<
    T extends TTokenNames,
    H extends THttpsBase<T>,
    S extends TStoreBase,
    N extends TNotificationsBase,
    C extends TConserveBase<T, H, S>,
    L extends TNeedsBase<T, S, H>,
  >
  extends Store<Record<keyof S, null | boolean>>
  implements IModule
{
  readonly #config: L;

  readonly #revertMap: { [K in keyof H]?: keyof S };

  readonly #modules: TNeedsModules<T, H, S, N, C>;

  readonly #namedLogger?: NamedLogger;

  constructor(config: L, modules: TNeedsModules<T, H, S, N, C>, logger?: Logger) {
    const store = fillObject<S, Record<keyof S, null>>(modules.store.state, () => null);
    super({ initialState: store }, {}, { name: MODULE_NAME }, logger);
    this.#modules = modules;
    this.#config = { ...config };
    this.#revertMap = Object.fromEntries(
      Object.entries(config).map<[keyof H, keyof S]>(
        ([key, value]: [keyof S, Required<TNeedsItem<T, H, S[keyof S]>>]) => [value.requestName, key],
      ),
    ) as unknown as { [K in keyof H]?: keyof S };
    this.#namedLogger = logger?.named(MODULE_NAME);
  }

  public restart(): void {
    Object.values(this.#modules).forEach((module) => module.restart()); // TODO: нужно ли это делать? При общем использовании и при частичном
    super.restart();
    this.#namedLogger?.restart();
  }

  public updateStateByRequestName(requestName: keyof H) {
    const name = this.#revertMap[requestName];
    if (!name) return;

    const value = this.#modules.store.get(name);
    super.set(name, () => !this.#modules.store.isEmpty(name, value));
  }

  public async action<Name extends keyof L = keyof L>(
    name: Name,
    type: NeedsActionTypes = NeedsActionTypes.request,
    ...args: Parameters<L[Name] extends keyof H ? H[L[Name]][0] : () => void>
  ): Promise<void> {
    if (!!super.get(name) && type === NeedsActionTypes.request) return;

    if (type === NeedsActionTypes.request) {
      const storeData = this.#modules.store.get(name);
      if (storeData && !this.#modules.store.isEmpty(name, storeData)) {
        super.set(name, () => true);
        return;
      }
    }

    if (super.get(name) === false && type === NeedsActionTypes.request) return;

    const requestName = this.#config[name];
    if (!requestName) {
      this.#namedLogger?.message(`Request name for ${name.toString()} not found.`);
      super.set(name, () => false);
      return;
    }

    const { validData, fetchData } = await this.#modules.https.namedRequest(requestName, ...args);

    if (validData) {
      super.set(name, () => true);
      this.#modules.conserve.save(requestName, validData, fetchData);
    } else {
      // this.#modules.store.set(name, () => null);
      super.set(name, () => false);
    }
  }
}

export default Needs;
