import { Loader, Messages, Timer, Token, Request, Https, Notifications } from '@modules';
import { Logger } from '@core';
import { NeedsActionTypes } from '@types';

import type {
  // CheckRM,
  IManagerConfig,
  IManagerModules,
  NoStringIndex,
  RequestManagerBase,
  THttpsAdapter,
  TNotification,
  TNotificationsBase,
  TNotificationsSettings,
  TStoreBase,
  TSubscribeFn,
  TTokenNames,
} from '@types';

import { ConserveAdapter, NeedsAdapter, StoreAdapter, TokenAdapter } from './core/adapters';
import { IsFullConfig } from './modules/Https';

class RequestManager<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  // RM extends CheckRM<T, S, RequestManagerBase<T, S>>,
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
            !IsFullConfig<T, THttpsAdapter<T, S, RM>, typeof name>(config.namedRequests[name]) ||
            !config.namedRequests[name].mock
          )
            return;

          return config.namedRequests[name].mock(input, init);
        },
      },
      config.settings?.request,
    );

    // Combain modules
    const notificationsModule = new Notifications<N>({ timer: timerModule }, config.settings?.notifications, logger);
    const storeModule = new StoreAdapter(config.store, config.settings?.cache, logger);
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
    const conserveModule = new ConserveAdapter<T, S, RM, N>(config, { store: storeModule }, logger);
    const needsModule = new NeedsAdapter<T, S, RM, N>(
      config,
      { store: storeModule, https: httpsModule, conserve: conserveModule },
      logger,
    );

    this.#modules = {
      loader: loaderModule,
      store: storeModule,
      token: tokenModule,
      https: httpsModule,
      needs: needsModule,
      notifications: notificationsModule,
      conserve: conserveModule,
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

  public async namedRequest<Name extends keyof THttpsAdapter<T, S, RM>>(
    name: Name,
    ...args: Parameters<THttpsAdapter<T, S, RM>[Name][0]>
  ): Promise<{ response: Response; validData: THttpsAdapter<T, S, RM>[Name][1] | null; data: unknown }> {
    const { validData, fetchData, ...rest } = await this.#modules.https.namedRequest(name, ...args);
    if (validData) {
      this.#modules.conserve.save(name, validData, fetchData);
      this.#modules.needs.updateStateByRequestName(name);
    }
    return { validData, ...rest };
  }

  public async needAction<Name extends keyof S = keyof S>(
    name: Name,
    type: NeedsActionTypes = NeedsActionTypes.request,
    ...args: Parameters<THttpsAdapter<T, S, RM>[Name][0]>
  ): Promise<void> {
    return this.#modules.needs.action<Name>(name, type, ...args);
  }

  public sendNotification(
    props: Omit<TNotification<N>, 'id' | 'drop'> & Partial<Pick<TNotificationsSettings, 'duration' | 'sticky'>>,
  ): () => void {
    return this.#modules.notifications.send(props);
  }

  public subscribe(fn?: TSubscribeFn<S>): () => void {
    return this.#modules.store.subscribe(fn);
  }

  public get state(): S {
    return this.#modules.store.state;
  }

  public get<K extends keyof S = keyof S>(key: K): S[K] {
    return this.#modules.store.get(key);
  }

  public set<K extends keyof S = keyof S>(key: K, fn: (prev: S[K]) => S[K]): void {
    this.#modules.store.set(key, fn);
  }

  public getModule<Name extends keyof NoStringIndex<IManagerModules<T, S, RM, N>>>(
    name: Name,
  ): IManagerModules<T, S, RM, N>[Name] | never {
    if (!(name in this.#modules)) throw new Error(`RequestManager module ${name} does't exists.`);
    return this.#modules[name];
  }
}

export default RequestManager;
