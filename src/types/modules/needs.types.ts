import type { THttpsBase } from './https.types';
import type { TStoreBase } from './store.types';
import type { TTokenNames } from './token.types';

export type TNeedsBase<T extends TTokenNames, S extends TStoreBase, H extends THttpsBase<T>> = Record<
  keyof S,
  keyof H | undefined
>;

export enum NeedsActionTypes {
  /**
   * Стандартный запрос с кэшом
   */
  request = 'request',
  /**
   * Принудительно перезапрашивает минуя кэш
   */
  refresh = 'refresh',
}

// type TNeedsSettings = {};
export type TNeedsConverterFn<State extends TStoreBase[keyof TStoreBase], Value> = (props: {
  state: State;
  validData: Value;
}) => State;
export type TNeedsItem<T extends TTokenNames, H extends THttpsBase<T>, V> = {
  requestName: keyof H;
  converter?: TNeedsConverterFn<V, H[keyof H][1]>;
};
export type INeedsConfig<T extends TTokenNames, H extends THttpsBase<T>, S extends TStoreBase> = {
  [K in keyof S]: TNeedsItem<T, H, S[K]>;
};
