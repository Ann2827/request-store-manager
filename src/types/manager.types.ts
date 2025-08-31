import { Conserve, Https, Loader, Needs, Notifications, Store, Token } from '@modules';

import { IModule } from './module.types';
import { NoStringIndex, SelectKeys } from './common.types';

import type { TConserveAdapter, THttpsAdapter } from './adapter.types';
import type {
  IHttpsRequest,
  IMessagesConfig,
  TCacheOptions,
  TCacheSettings,
  THttpsConfigNamedRequest,
  THttpsSettings,
  TNeedsBase,
  TNotificationsBase,
  TNotificationsSettings,
  TRequestSettings,
  TStoreBase,
  TStoreEmptyFn,
  TStoreValidationFn,
  TTokenNames,
  TTokenSettings,
  TTokenTemplate,
} from './modules';

export interface Template<T extends TTokenNames, S extends TStoreBase> {
  // args?: any[];
  fn: (...args: any) => IHttpsRequest<T>;
  success: any;
  error?: any;
  /**
   * Куда автоматически сохранять (преобразованный?) ответ. Несколько namedRequests могут сохранять данные в один store key.
   */
  storeKey?: keyof S | undefined;
}
export type RequestManagerBase<T extends TTokenNames, S extends TStoreBase> = Record<PropertyKey, Template<T, S>>;

export interface IManagerModules<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> extends Record<string, IModule> {
  loader: Loader;
  store: Store<S>;
  token: Token<T>;
  needs: Needs<T, THttpsAdapter<T, S, RM>, S, N, TConserveAdapter<T, S, RM>, TNeedsBase<T, S, THttpsAdapter<T, S, RM>>>;
  https: Https<T, THttpsAdapter<T, S, RM>, N>;
  notifications: Notifications<N>;
  conserve: Conserve<T, THttpsAdapter<T, S, RM>, S, TConserveAdapter<T, S, RM>>;
}

export type TManagerSettings = {
  logger: boolean;
  request: Partial<TRequestSettings>;
  notifications: Partial<TNotificationsSettings>;
  cache: Partial<Omit<TCacheSettings, 'postfix'>>;
  token: Partial<TTokenSettings>;
  https: Partial<THttpsSettings>;

  // needs: Partial<{ waitRequest: true }>;
};

export type TTokenOption = { template: TTokenTemplate; cache?: boolean | Partial<TCacheOptions> };

export type TManagerStore<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  Key extends keyof S,
> = {
  default: S[Key];
  cache?: TCacheOptions;
  autoRequest?: SelectKeys<NoStringIndex<RM>, { storeKey: Key }, 'contains->'> | undefined;
  // autoRequest?: keyof RM;
  validation?: TStoreValidationFn<S[Key]>;
  isEmpty?: TStoreEmptyFn<S[Key]>;
};
export type TManagerSave<S extends TStoreBase, Key extends keyof S, Result> = {
  storeKey: Key;
  converter?: (props: { state: S[Key]; validData: Result }) => S[Key];
};
export type TManagerSaveConfig<S extends TStoreBase, Key extends keyof S | undefined, Result> = Key extends keyof S
  ? TManagerSave<S, Key, Result>
  : undefined;

export type TManagerConfigFull<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  K extends keyof RM,
> = THttpsConfigNamedRequest<T, THttpsAdapter<T, S, RM>, K> & {
  mock?: (...params: Parameters<typeof globalThis.fetch>) => Response;
  save?: TManagerSaveConfig<S, keyof S, RM[K]['success']>;
  // save?: TManagerSaveConfig<S, RM[K]['storeKey'], RM[K]['success']>;
};
export interface IManagerConfig<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> {
  settings?: Partial<TManagerSettings>;
  tokens: Record<T, TTokenOption>;
  store: {
    [K in keyof S]: TManagerStore<T, S, RM, K>;
    // [K in keyof S]: S[K] | TManagerStore<T, S, RM, K>;
  };
  namedRequests: {
    [K in keyof RM]: RM[K]['fn'] | TManagerConfigFull<T, S, RM, K>;
  };
  messages?: {
    codes: IMessagesConfig<N>['codes'];
  };
}

type SKeyRMName<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [KS in keyof S]: SelectKeys<
    {
      [KH in keyof NoStringIndex<RM>]: RM[KH]['storeKey'];
    },
    KS,
    'equals'
  >;
};
export type CheckRM<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
> = keyof S extends keyof SKeyRMName<T, S, RM> ? RM : never;
