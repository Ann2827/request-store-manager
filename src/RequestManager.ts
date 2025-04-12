import { Loader, Messages, Timer, Token, Request, Https, Notifications } from '@modules';
import { Logger } from '@core';

import type {
  CheckRM,
  IManagerConfig,
  IManagerModules,
  NeedsActionTypes,
  RequestManagerBase,
  THttpsAdapter,
  TNeedsAdapter,
  TNotification,
  TNotificationsBase,
  TNotificationsSettings,
  TStoreBase,
  TTokenNames,
} from '@types';

import { NeedsAdapter, StoreAdapter, TokenAdapter } from './core/adapters';
import { IsFullConfig } from './modules/Https';

/**
 * FIXME: Фасад -> Компоновщик
 */
class RequestManager<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends CheckRM<T, S, RequestManagerBase<T, S>>,
  N extends TNotificationsBase = TNotificationsBase,
> {
  readonly #modules: IManagerModules<T, S, RM, N>;

  constructor(config: IManagerConfig<T, S, RM, N>) {
    const logger = new Logger(config.settings?.logger ?? false);

    // Simple modules
    const timerModule = new Timer(logger);
    const loaderModule = new Loader(logger);
    const requestModule = new Request(
      {
        mockFn: (name, input, init): Response | undefined => {
          if (
            !name ||
            !config.namedRequests?.[name] ||
            !IsFullConfig<T, THttpsAdapter<T, S, RM>>(config.namedRequests[name]) ||
            !config.namedRequests[name].mock
          )
            return;

          return config.namedRequests[name].mock(input, init);
        },
      },
      config.settings?.request,
      logger,
    );

    // Combain modules
    const notificationsModule = new Notifications<N>({ timer: timerModule }, config.settings?.notifications, logger);
    const storeModule = new StoreAdapter(config, logger);
    const tokenModule = new TokenAdapter<T, S, RM, N>(config, { timer: timerModule }, logger);
    const httpsModule = new Https<T, THttpsAdapter<T, S, RM>, N>(
      config.namedRequests,
      {
        request: requestModule,
        loader: loaderModule,
        token: tokenModule,
        messages: new Messages<N>(config.messages),
        notifications: notificationsModule,
      },
      config.settings?.https,
      logger,
    );
    const needsModule = new NeedsAdapter<T, S, RM, N>(config, { store: storeModule, https: httpsModule }, logger);

    this.#modules = {
      loader: loaderModule,
      store: storeModule,
      token: tokenModule,
      https: httpsModule,
      needs: needsModule,
      notifications: notificationsModule,
    };

    this.connectLoader = this.connectLoader.bind(this);
    this.connectNotifications = this.connectNotifications.bind(this);
  }

  public restart(): void {
    Object.values(this.#modules).forEach((module) => module.restart());
  }

  public connectLoader() {
    // const { subscribe, state } = this.#modules.loader;
    return this.#modules.loader;
  }

  public connectNotifications() {
    return this.#modules.notifications;
  }

  public setToken(...args: Parameters<Token<T>['setToken']>): void {
    return this.#modules.token.setToken(...args);
  }

  public namedRequest(
    ...args: Parameters<Https<T, THttpsAdapter<T, S, RM>, N>['namedRequest']>
  ): ReturnType<Https<T, THttpsAdapter<T, S, RM>, N>['namedRequest']> {
    return this.#modules.https.namedRequest(...args);
  }

  public async needAction<Name extends keyof S = keyof S>(
    name: Name,
    type: NeedsActionTypes,
    ...args: Parameters<
      TNeedsAdapter<T, S, RM>[Name] extends keyof THttpsAdapter<T, S, RM>
        ? THttpsAdapter<T, S, RM>[TNeedsAdapter<T, S, RM>[Name]][0]
        : () => void
    >
  ): Promise<void> {
    return this.#modules.needs.action(name, type, ...args);
  }

  public sendNotification(
    props: Omit<TNotification<N>, 'id'> & Partial<Pick<TNotificationsSettings, 'duration' | 'sticky'>>,
  ): () => void {
    return this.#modules.notifications.send(props);
  }

  public subscribe() {
    // FIXME: работает?
    return this.#modules.needs.subscribe.bind(this);
  }

  public get<K extends keyof S = keyof S>(key: K): S[K] {
    return this.#modules.store.get(key);
  }

  public set<K extends keyof S = keyof S>(key: K, fn: (prev: S[K]) => S[K]): void {
    this.#modules.store.set(key, fn);
  }

  public getModule<Name extends keyof IManagerModules<T, S, RM, N>>(
    name: Name,
  ): IManagerModules<T, S, RM, N>[Name] | never {
    if (!(name in this.#modules)) throw new Error(`RequestManager module ${name} does't exists.`);
    return this.#modules[name];
  }
}

export default RequestManager;
