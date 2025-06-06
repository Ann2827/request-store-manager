import { isArray, isObject } from './guards';

export const arrToStr = (arr?: string[] | string, splitter = ', '): string => {
  if (!arr) return '';
  if (typeof arr === 'string') return arr;
  return arr.join(splitter);
};

export const unflattenItem = (keys: string[], value: unknown): Record<string, unknown> => {
  const [firstKey] = keys;
  if (!firstKey) return {};
  if (keys.length === 1) return { [firstKey]: value };

  return { [firstKey]: unflattenItem(keys.slice(1), value) };
};
export const unflatten = <T>(obj: Record<string, unknown>, separator = '.'): T =>
  Object.entries(obj).reduce<T>(
    (prev, [key, value]) => ({ ...prev, ...unflattenItem(key.split(separator), value) }),
    {} as T,
  );

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type KeysStartingWith<Set, Needle extends string> = Set extends `${Needle}${infer _X}` ? Set : never;
type PickByNotStartingWith<T, NotStartWith extends string> = Omit<T, KeysStartingWith<keyof T, NotStartWith>>;
export type TOnlyPublic<T> = PickByNotStartingWith<T, '_'>;
export const onlyPublic = <T extends Record<string, unknown>>(obj: T): TOnlyPublic<T> => {
  const updateObj = { ...obj };
  (Object.keys(updateObj) as Array<keyof typeof updateObj>).forEach((key) => {
    if (typeof key === 'string' && key[0] === '_') delete updateObj[key];
  });
  return updateObj;
};

export const fillObject = <T extends Record<PropertyKey, unknown>, V extends Record<keyof T, unknown>>(
  obj: T,
  fn: <K extends keyof T = keyof T>(value: T[K], key: K) => V[K],
): { [K in keyof T]: V[K] } =>
  Object.fromEntries(
    (Object.entries(obj) as [keyof T, T[keyof T]][]).map<[keyof T, V[keyof T]]>(([key, value]) => [
      key,
      fn(value, key),
    ]),
  ) as { [K in keyof T]: V[K] };
export const fillObject2 = <T extends object, V extends Record<keyof T, unknown>>(
  obj: T,
  fn: <K extends keyof T = keyof T>(value: T[K], key: K) => V[K],
): V =>
  Object.fromEntries(
    (Object.entries(obj) as [keyof T, T[keyof T]][]).map<[keyof T, V[keyof T]]>(([key, value]) => [
      key,
      fn(value, key),
    ]),
  ) as V;
export const fillFilterObject = <T extends Record<PropertyKey, unknown>, V extends { [K in keyof T]?: unknown }>(
  obj: T,
  fn: <K extends keyof T = keyof T>(value: T[K], key: K) => V[K],
): Exclude<{ [K in keyof T]?: V[K] }, undefined> =>
  Object.fromEntries(
    (Object.entries(obj) as [keyof T, T[keyof T]][])
      .map<[keyof T, V[keyof T]]>(([key, value]) => [key, fn(value, key)])
      .filter(([_, value]) => value !== undefined),
  ) as Exclude<{ [K in keyof T]?: V[K] }, undefined>;

export const filterObj = <T extends Record<PropertyKey, unknown>, R>(
  obj: T,
  rule: <K extends keyof T = keyof T>(value: T[K], key: K) => boolean,
): R =>
  (Object.entries(obj) as [keyof T, T[keyof T]][]).reduce((prev, [key, value]) => {
    if (rule(value, key)) return { ...prev, [key]: value };
    return prev;
  }, {} as R);

/**
 * Возвращает тело функции в виде строки
 */
export function stringifyFunction(_: any, val: any): any {
  return typeof val === 'function' ? `${val}`.replaceAll('\n', '').replaceAll('  ', '') : val;
}

export function clone<T extends object | []>(data: T): T {
  if (isObject<T>(data)) return { ...data };
  if (isArray<T>(data)) return [...data];
  return data;
}
