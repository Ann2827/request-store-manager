// TODO: cleanWhenResponseIs: boolean | number[]

/**
 * Перечислите имена токенов
 * @example 'main' | 'second'
 */
export type TTokenNames = PropertyKey;

export type TTokenValue = string | null;
/**
 * 'bearer' = template "Authorization:Bearer ${token}"
 * Example custom template: "x-auth:Bearer ${token}"
 * Header делиться на name и value по ":"
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type TTokenTemplate = 'bearer' | string;

export type TTokenSettings = {
  /**
   * Время ожидания токена. По истечении Promise вызовет reject
   * @default 0
   */
  waitTime: number;
};

export type TTokenConfig<T extends TTokenNames> = Record<T, TTokenTemplate>;
