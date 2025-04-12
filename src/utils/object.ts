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

export const fillFromArray = <K extends PropertyKey, V>(keys: K[], value: V): Record<K, V> =>
  Object.fromEntries<V>(keys.map<[K, V]>((key) => [key, value])) as Record<K, V>;

export const fillFromArrayFn = <K extends PropertyKey, V>(keys: K[], fn: (key: K) => V): Record<K, V> =>
  Object.fromEntries<V>(keys.map<[K, V]>((key) => [key, fn(key)])) as Record<K, V>;
// interface Applicative<T> {}
export const fillFromArrayFn3 = <T extends Record<string, unknown>, V extends Record<keyof T, unknown>>(
  obj: T,
  fn: <K extends keyof T = keyof T>(key: K) => V[K],
): { [K in keyof T]: V[K] } =>
  Object.fromEntries(Object.keys(obj).map<[keyof T, V[keyof T]]>((key) => [key, fn(key)])) as { [K in keyof T]: V[K] };

// TODO: rename
export const fillFromArrayFn2 = <K extends PropertyKey, V, V2>(
  entries: [K, V][],
  fn: (value: V) => V2,
): Record<K, V2> => Object.fromEntries<V2>(entries.map<[K, V2]>(([key, value]) => [key, fn(value)])) as Record<K, V2>;
export const fillFromArrayFn4 = <T extends Record<string, unknown>, V>(
  obj: T,
  fn: (value: T[keyof T]) => V,
): Record<keyof T, V> =>
  Object.fromEntries<V>(
    (Object.entries(obj) as [keyof T, T[keyof T]][]).map<[keyof T, V]>(([key, value]) => [key, fn(value)]),
  ) as Record<keyof T, V>;
export const fillFromArrayFn5 = <T extends Record<PropertyKey, unknown>, V extends Record<keyof T, unknown>>(
  obj: T,
  fn: <K extends keyof T = keyof T>(value: T[K], key: K) => V[K],
): { [K in keyof T]: V[K] } =>
  Object.fromEntries(
    (Object.entries(obj) as [keyof T, T[keyof T]][]).map<[keyof T, V[keyof T]]>(([key, value]) => [
      key,
      fn(value, key),
    ]),
  ) as { [K in keyof T]: V[K] };

/**
 * Возвращает тело функции в виде строки
 */
export function stringifyFunction(_: any, val: any): any {
  return typeof val === 'function' ? `${val}`.replaceAll('\n', '').replaceAll('  ', '') : val;
}
