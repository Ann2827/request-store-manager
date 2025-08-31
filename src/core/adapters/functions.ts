import type { RequestManagerBase, TManagerConfigFull, TTokenNames, TStoreBase, TManagerStore } from '@types';

export function IsFullRequestConfig<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  K extends keyof RM,
>(payload: unknown): payload is TManagerConfigFull<T, S, RM, K> {
  return typeof payload === 'object' && !!payload && 'request' in payload && typeof payload.request === 'function';
}

export function IsFullStoreConfig<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  Key extends keyof S,
>(payload: unknown): payload is TManagerStore<T, S, RM, Key> {
  return typeof payload === 'object' && !!payload && 'default' in payload;
}
