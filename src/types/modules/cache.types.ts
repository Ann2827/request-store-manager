import type { TStorage } from '../storage.types';

export type TCacheSettings = { prefix: string; postfix?: string };
export type TCacheOptions = { place: TStorage; maxAge: number };

/**
 * Перечислите имена без префиксов
 * @example 'name1' | 'name2'
 */
export type TCacheNames = PropertyKey;

export type TCacheConfig<C extends TCacheNames> = {
  [K in C]: Partial<TCacheOptions> | boolean;
};
