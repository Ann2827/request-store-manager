export type TStoreBaseValue = unknown;
export type TStoreBase = Record<PropertyKey, TStoreBaseValue>;

export type TStoreValidationFn<V extends TStoreBaseValue> = (payload: unknown) => payload is V;
export type TStoreEmptyFn<V extends TStoreBaseValue> = (value: V) => boolean;

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
   * Какое значение считать пустым? Используется, как правило получение кэша. Если значение пустое, то пробуем достать из кэша.
   * @default (value) => !value
   */
  isEmpty?: {
    [K in keyof S]?: TStoreEmptyFn<S[K]>;
  };
};
