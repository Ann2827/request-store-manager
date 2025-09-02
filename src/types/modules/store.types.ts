export type TStoreBase = Record<PropertyKey, unknown>;

export type TStoreValidationFn<V extends TStoreBase[keyof TStoreBase]> = (payload: unknown) => payload is V;
export type TStoreEmptyFn<V extends TStoreBase[keyof TStoreBase]> = (value: V) => boolean;

export type TStoreSettings = {
  /**
   * Используется для логгирования.
   */
  name: string;
};
export type TStoreConfig<S extends TStoreBase> = {
  initialState: S;
  /**
   * Валидация данных не позволит восстановить состояние из невалидного/устаревшего кэша. И положить в состояние невалидные данные.
   */
  validation?: {
    [K in keyof S]?: TStoreValidationFn<S[K]>;
  };
  validationFull?: TStoreValidationFn<S>;
  /**
   * Какое значение считать пустым? Используется, как правило полученя кэша. Если значение пустое, то пробуем достать из кэша.
   * @default (value) => !value
   */
  isEmpty?: {
    [K in keyof S]?: TStoreEmptyFn<S[K]>;
  };
};
