import { IHttpsRequest, THttpsBase } from './https.types';
import { TStoreBase } from './store.types';
import { TTokenNames } from './token.types';

export type TConserveBase<T extends TTokenNames, H extends THttpsBase<T>, S extends TStoreBase> = {
  [K in keyof H]?: keyof S | undefined;
};

export type TConserveConverterFn<T extends TTokenNames, H extends THttpsBase<T>, K extends keyof H, Value> = (props: {
  state: Value;
  validData: H[K][1];
  fetchData: IHttpsRequest<T>;
}) => Value;

export type TConserveConfigItem<
  T extends TTokenNames,
  H extends THttpsBase<T>,
  S extends TStoreBase,
  K extends keyof H,
  Z extends keyof S,
> = {
  storeKey: Z;
  converter?: TConserveConverterFn<T, H, K, S[Z]>;
};

export type TConserveConfig<
  T extends TTokenNames,
  H extends THttpsBase<T>,
  S extends TStoreBase,
  C extends TConserveBase<T, H, S>,
> = {
  //   [K in Extract<keyof C, keyof H>]?: C[K] extends keyof S ? TConserveConfigItem<T, H, S, K, C[K]> : undefined;
  [K in keyof C]?: C[Extract<K, keyof H>] extends keyof S
    ? TConserveConfigItem<T, H, S, Extract<K, keyof H>, C[Extract<K, keyof H>]>
    : undefined;
  //   [K in keyof H]?: C[K] extends keyof S ? TConserveConfigItem<T, H, S, K, C[K]> : undefined;
  // Extract<keyof C, string>
};
