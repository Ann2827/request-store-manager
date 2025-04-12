import { Https, Loader, Needs, Notifications, Store, Token } from '@modules';

import { IModule } from './module.types';
import { NoStringIndex, SelectKeys } from './common.types';

import type { THttpsAdapter, TNeedsAdapter } from './adapter.types';
import type {
  IHttpsRequest,
  IMessagesConfig,
  TCacheOptions,
  TCacheSettings,
  THttpsConfigNamedRequest,
  THttpsSettings,
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

// type Single<T extends object> = LengthObject<T>['length'] extends 1 ? T : never;
export interface Template<T extends TTokenNames, S extends TStoreBase> {
  // args?: any[];
  fn: (...args: any) => IHttpsRequest<T>;
  success: any;
  error?: unknown;
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
  needs: Needs<T, S, THttpsAdapter<T, S, RM>, N, TNeedsAdapter<T, S, RM>>;
  https: Https<T, THttpsAdapter<T, S, RM>, N>;
  notifications: Notifications<N>;
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

export type TManagerStore<S extends TStoreBase, Key extends keyof S, Result> = {
  key: Key;
  default: S[Key];
  converter?: (props: { state: S[Key]; validData: Result }) => S[Key];
  cache?: TCacheOptions;
  validation?: TStoreValidationFn<S[Key]>;
  empty?: TStoreEmptyFn<S[Key]>;
};
export type TManagerStoreConfig<S extends TStoreBase, Key extends keyof S | undefined, Result> = Key extends keyof S
  ? TManagerStore<S, Key, Result>
  : undefined;

export type TManagerConfigFull<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  K extends keyof RM,
> = THttpsConfigNamedRequest<T, THttpsAdapter<T, S, RM>> & {
  store?: TManagerStoreConfig<S, RM[K]['storeKey'], RM[K]['success']>;
  mock?: (...params: Parameters<typeof globalThis.fetch>) => Response;
};
export interface IManagerConfig<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> {
  settings?: Partial<TManagerSettings>;
  tokens: Record<T, TTokenOption>;
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
