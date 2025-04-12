import { CacheStrict, Store } from '@modules';
import { fillObject } from '@utils';

import type {
  IManagerConfig,
  RequestManagerBase,
  TCacheOptions,
  TManagerStore,
  TNotificationsBase,
  TStoreBase,
  TStoreEmptyFn,
  TStoreValidationFn,
  TTokenNames,
} from '@types';

import Logger from '../Logger';

import { IsFullRequestConfig } from './functions';

type TGetRequestSuccessByStoreKey<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  Key extends keyof S,
> = { [K in keyof RM]-?: Key extends RM[K]['storeKey'] ? RM[K]['success'] : never }[keyof RM];

type TStoreTemplate<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [K in keyof S]: TManagerStore<S, K, TGetRequestSuccessByStoreKey<T, S, RM, K>>; // | THttpsBaseSuccess
};

class StoreAdapter<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> extends Store<S> {
  constructor(config: IManagerConfig<T, S, RM, N>, logger: Logger) {
    const store: TStoreTemplate<T, S, RM> = Object.entries(config.namedRequests).reduce<TStoreTemplate<T, S, RM>>(
      (prev, [hKey, request]) => {
        if (IsFullRequestConfig<T, S, RM, typeof hKey>(request) && request?.store)
          return { ...prev, [request.store.key]: request.store };
        return prev;
      },
      {} as TStoreTemplate<T, S, RM>,
    );

    super(
      {
        initialState: fillObject<TStoreTemplate<T, S, RM>, { [K in keyof S]: S[K] }>(store, (value) => value?.default),
        validation: fillObject<TStoreTemplate<T, S, RM>, { [K in keyof S]: TStoreValidationFn<S[K]> | undefined }>(
          store,
          (value) => value?.validation,
        ),
        empty: fillObject<TStoreTemplate<T, S, RM>, { [K in keyof S]: TStoreEmptyFn<S[K]> | undefined }>(
          store,
          (value) => value?.empty,
        ),
      },
      {
        cache: new CacheStrict<keyof typeof store>(
          fillObject<TStoreTemplate<T, S, RM>, { [K in keyof S]: TCacheOptions | boolean }>(
            store,
            (value) => value?.cache ?? false,
          ),
          { ...config.settings?.cache, postfix: 'store' },
          logger,
        ),
      },
      { name: undefined },
      logger,
    );
  }
}

export default StoreAdapter;
