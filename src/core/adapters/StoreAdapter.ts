import { CacheStrict, Store } from '@modules';
import { fillObject } from '@utils';

import type {
  RequestManagerBase,
  TCacheOptions,
  TCacheSettings,
  TManagerStore,
  TStoreBase,
  TStoreEmptyFn,
  TStoreValidationFn,
  TTokenNames,
} from '@types';

import Logger from '../Logger';

import { IsFullStoreConfig } from './functions';

type TStoreOriginalConfig<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [K in keyof S]: TManagerStore<T, S, RM, K> | S[K];
};

class StoreAdapter<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> extends Store<S> {
  constructor(
    store: TStoreOriginalConfig<T, S, RM>,
    cacheSettings: Partial<Omit<TCacheSettings, 'postfix'>> | undefined,
    logger: Logger,
  ) {
    super(
      {
        initialState: fillObject<TStoreOriginalConfig<T, S, RM>, S>(store, (value, key) =>
          IsFullStoreConfig<T, S, RM, typeof key>(value) ? value.default : (value as S[typeof key]),
        ),
        validation: fillObject<
          TStoreOriginalConfig<T, S, RM>,
          { [K in keyof S]: TStoreValidationFn<S[K]> | undefined }
        >(store, (value, key) => (IsFullStoreConfig<T, S, RM, typeof key>(value) ? value?.validation : undefined)),
        isEmpty: fillObject<TStoreOriginalConfig<T, S, RM>, { [K in keyof S]: TStoreEmptyFn<S[K]> | undefined }>(
          store,
          (value, key) => (IsFullStoreConfig<T, S, RM, typeof key>(value) ? value?.isEmpty : undefined),
        ),
      },
      {
        cache: new CacheStrict<keyof typeof store>(
          fillObject<TStoreOriginalConfig<T, S, RM>, { [K in keyof S]: TCacheOptions | boolean }>(
            store,
            (value, key) => (IsFullStoreConfig<T, S, RM, typeof key>(value) ? value?.cache || false : false),
          ),
          { ...cacheSettings, postfix: 'store' },
          logger,
        ),
      },
      { name: undefined },
      logger,
    );
  }
}

export default StoreAdapter;
