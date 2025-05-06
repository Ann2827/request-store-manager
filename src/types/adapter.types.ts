import type { Invert, NoStringIndex, Select, SelectKeys } from './common.types';
import type { IManagerConfig, RequestManagerBase } from './manager.types';
import type { IHttpsRequest, TNotificationsBase, TStoreBase, TTokenNames } from './modules';

export type THttpsAdapter<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [K in keyof RM]: [(...args: Parameters<RM[K]['fn']>) => IHttpsRequest<T>, RM[K]['success'], RM[K]['error']];
};

type TNeedsSelectStore<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = Select<
  NoStringIndex<RM>,
  { storeKey: keyof S },
  'contains->'
>;
export type TNeedsAdapter0<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = Invert<
  {
    [K in keyof TNeedsSelectStore<T, S, RM>]-?: TNeedsSelectStore<T, S, RM>[K]['storeKey'] extends keyof S
      ? TNeedsSelectStore<T, S, RM>[K]['storeKey']
      : keyof S;
  },
  keyof S
>;
export type TNeedsAdapter2<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> = Select<IManagerConfig<T, S, RM, N>['store'], { autoRequest: keyof RM }, 'contains->'>;
export type TNeedsAdapter<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  // N extends TNotificationsBase,
> = {
  // [K in keyof S]: IManagerConfig<T, S, RM, N>['store'][K]['autoRequest'];
  [K in keyof S]: SelectKeys<NoStringIndex<RM>, { storeKey: K }, 'contains->'> | undefined;
  // [K in keyof S]: IManagerConfig<T, S, RM, N>['store'][K]['autoRequest'] extends keyof RM
  //   ? IManagerConfig<T, S, RM, N>['store'][K]['autoRequest']
  //   : undefined;
  // [K in keyof S]: Has<IManagerConfig<T, S, RM, N>['store'][K], 'autoRequest', keyof RM> extends 1
  //   ? IManagerConfig<T, S, RM, N>['store']['autoRequest']
  //   : undefined;
};

export type TConserveAdapter<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [K in keyof RM]: RM[K]['storeKey'];
};
