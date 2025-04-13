import type { THttpsBase } from './https.types';
import type { TStoreBase } from './store.types';
import type { TTokenNames } from './token.types';

export type TNeedsBase<T extends TTokenNames, S extends TStoreBase, H extends THttpsBase<T>> = Record<
  keyof S,
  keyof H | undefined
>;
// export type TNeedsBase<T extends TTokenNames, S extends TStoreBase, H extends THttpsBase<T>> = {
//   [K in keyof S]: keyof H;
// };

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
  //   map: { [K in keyof S]: keyof H };
  //   converters?: {
  //     [K in keyof S]?: TNeedsConverterFn<S[K], H[keyof H][1]>;
  //   };
  [K in keyof S]: TNeedsItem<T, H, S[K]>;
};
