import { fillObject, replace } from '@utils';
import { Logger, NamedLogger } from '@core';

import type {
  IModule,
  TStoreEmptyFn,
  TTokenConfig,
  TTokenNames,
  TTokenSettings,
  TTokenTemplate,
  TTokenValue,
} from '@types';

import Timer from './Timer';
import Store, { type TStateModules } from './Store';

export type TTokenModules = { timer: Timer };

export const MODULE_NAME = 'token';

function IsToken(payload: unknown): payload is TTokenValue {
  return payload === null || (typeof payload === 'string' && !!payload);
}
function IsEmpty(value: TTokenValue): boolean {
  return value === null;
}

class Token<T extends TTokenNames> extends Store<Record<T, TTokenValue>> implements IModule {
  readonly #namedLogger?: NamedLogger;

  readonly #config: TTokenConfig<T>;

  readonly #settings: TTokenSettings;

  readonly #modules: TTokenModules;

  #tokenHeader(token: string, template?: TTokenTemplate): [string, string] {
    if (!template) return ['Authorization', token];
    if (template === 'bearer') return ['Authorization', `Bearer ${token}`];
    const [name = 'Authorization', value = '${token}'] = template.split(':');
    return [name, replace(value, { token })];
  }

  constructor(
    config: TTokenConfig<T>,
    modules: TTokenModules & TStateModules<T>,
    settings?: Partial<TTokenSettings>,
    logger?: Logger,
  ) {
    const namedLogger = logger?.named(MODULE_NAME);
    const initialState = fillObject<TTokenConfig<T>, Record<T, TTokenValue>>(config, () => null);
    const validation = fillObject<TTokenConfig<T>, Record<T, typeof IsToken>>(config, () => IsToken);
    const empty = fillObject<TTokenConfig<T>, Record<T, TStoreEmptyFn<TTokenValue>>>(config, () => IsEmpty);
    super({ initialState, validation, isEmpty: empty }, { cache: modules?.cache }, { name: MODULE_NAME }, logger);

    this.#namedLogger = namedLogger;
    this.#config = config;
    this.#settings = {
      waitTime: settings?.waitTime ?? 0,
    };
    this.#modules = { timer: modules.timer };
  }

  public restart() {
    Object.values(this.#modules).forEach((module) => module?.restart());
    super.restart();
    this.#namedLogger?.restart();
  }

  public setToken(name: T, value: TTokenValue): void {
    super.set(name, () => value);
  }

  public async getAuthHeader(name: T): Promise<[string, string] | null> {
    const token = super.get(name);
    if (token) {
      return this.#tokenHeader(token, this.#config[name]);
    }

    if (!this.#settings.waitTime) return null;

    const timerName = `${MODULE_NAME}-${name.toString()}`;
    return new Promise<[string, string]>((resolve, reject) => {
      if (this.#settings.waitTime) {
        this.#modules.timer.setTimer(timerName, this.#settings.waitTime, {
          callback: () => {
            reject(null);
          },
        });
      }
      const clean = super.subscribe((state) => {
        const awaitedToken = state?.[name];
        if (!awaitedToken) return;

        this.#modules.timer.clearTimer(timerName);
        clean();
        resolve(this.#tokenHeader(awaitedToken, this.#config[name]));
      });
    });
  }
}

export default Token;
