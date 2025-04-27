import type { THttpsBase } from './https.types';
import type { TStoreBase } from './store.types';
import type { TTokenNames } from './token.types';

export type TNeedsBase<T extends TTokenNames, S extends TStoreBase, H extends THttpsBase<T>> = {
  [K in keyof S]: keyof H | undefined;
};

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
