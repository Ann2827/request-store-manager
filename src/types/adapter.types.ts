import type { Invert, NoStringIndex, Select, SelectKeys } from './common.types';
import type { RequestManagerBase } from './manager.types';
import type { IHttpsRequest, TStoreBase, TTokenNames } from './modules';

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
export type TNeedsAdapter<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [K in keyof S]: SelectKeys<NoStringIndex<RM>, { storeKey: K }, 'contains->'>;
};
