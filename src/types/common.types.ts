export type PartialRecursive<T> = {
  [P in keyof T]?: PartialRecursive<T[P]>;
};
export type RequiredRecursive<T> = {
  [P in keyof T]-?: RequiredRecursive<T[P]>;
};
export type Obj = Record<PropertyKey, unknown>;

export type TSetFn<S> = S | ((prev: S) => S);
export type TSubscribeFn<S> = (next: S) => void;

export type GetSubRecord<Key extends PropertyKey, T extends Record<keyof T, Record<Key, any>>> = {
  [K in keyof T]: T[K][Key];
};
export type RevealArray<T extends Record<PropertyKey, any>, Value extends [PropertyKey, any]> = {
  [K in keyof T]: T[K] extends Value ? Record<T[K][0], T[K][1]> : never;
};
export type RecordToUnion<T extends Record<PropertyKey, any>> = T extends { [K in keyof T]: infer P } ? P : never;
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/**
 * Использовать для массива с определенным кол-вом однотипных эл-тов.
 * @example Tuple<[string], 3> = [string, string, string]
 */
export type Tuple<T extends any[], Q extends number> = T['length'] extends Q ? T : Tuple<[...T, T[0]], Q>;

export type LengthObject<T, K extends keyof T = keyof T> = [K] extends [never]
  ? []
  : K extends K
    ? [0, ...LengthObject<Omit<T, K>>]
    : never;

/**
 * @example ReverseMap<{ key: 'value' }> = { value: 'key' }
 */
export type ReverseMap<T extends Record<keyof T, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

/**
 * @example Include<'key', 'key' | 'other', true> = true
 * @example { [K in Include<'key', 'key' | 'other']: any }
 */
export type Include<Key extends PropertyKey, Keys extends PropertyKey, Value = true> =
  Key extends Extract<Keys, Key> ? Value : never;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ObjectRule<Key extends PropertyKey | never, Value> = {
  [K in Key]: Value;
};

/**
 * @example FilterByChildKey<'key', { stay: { key: 'name'; a: null }; fade: { b: null } }> = { stay: { key: 'name'; a: null } }
 */
export type FilterByChildKey<Key extends PropertyKey, T extends Record<keyof T, Record<Key | PropertyKey, any>>> = {
  [K in keyof T as Include<Key, keyof T[K], K>]: T[K];
};
export type FilterByChildKey2<Key extends PropertyKey, T extends Record<keyof T, Record<Key | PropertyKey, any>>> = {
  [K in keyof T as Include<Key, keyof T[K], K>]: T[K][Key];
};
export type FilterByChildKey3<Key extends PropertyKey, T extends Record<keyof T, Record<Key | PropertyKey, any>>> = {
  [K in keyof T as Key extends Extract<keyof T[K], Key> ? T[K][Key] : never]: K;
};

export type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

/**
 * https://github.com/millsp/ts-toolbelt/blob/master/sources/Object/Invert.ts
 */
type IntersectOf<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type ComputeRaw<A> = A extends () => void ? A : { [K in keyof A]: A[K] } & unknown;
export type Invert<O extends Record<keyof O, Value>, Value extends PropertyKey = PropertyKey> = O extends unknown
  ? ComputeRaw<
      IntersectOf<
        {
          // swaps the key and the value
          [K in keyof O]: Record<O[K], K>;
        }[keyof O]
      >
    >
  : never;

/**
 * https://github.com/millsp/ts-toolbelt/blob/master/sources/Object/Select.ts
 */
type MatchBase = 'default' | 'contains->' | 'extends->' | '<-contains' | '<-extends' | 'equals';
type Extends<A1, A2> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
type Equals<A1, A2> = (<A>() => A extends A2 ? 1 : 0) extends <A>() => A extends A1 ? 1 : 0 ? 1 : 0;
type Contains<A1, A2> = Extends<A1, A2> extends 1 ? 1 : 0;
type Is<A, A1, Match extends MatchBase = 'default'> = {
  default: Extends<A, A1>;
  'contains->': Contains<A, A1>;
  'extends->': Extends<A, A1>;
  '<-contains': Contains<A1, A>;
  '<-extends': Extends<A1, A>;
  equals: Equals<A1, A>;
}[Match];
export type SelectKeys<O extends object, M, Match extends MatchBase = 'default'> = O extends unknown
  ? {
      [K in keyof O]-?: {
        1: K;
        0: never;
      }[Is<O[K], M, Match>];
    }[keyof O]
  : never;
export type Select<O extends object, M, Match extends MatchBase = 'default'> = Pick<O, SelectKeys<O, M, Match>>;

export type CheckExtends<A1, A2, T, F> = {
  1: T;
  0: F;
}[Extends<A1, A2>];

/**
 * https://github.com/millsp/ts-toolbelt/blob/master/sources/Union/Last.ts
 */
export type Last<U> =
  IntersectOf<
    U extends unknown // Distribute U
      ? (x: U) => void
      : never // To intersect
  > extends (x: infer P) => void
    ? P // Extract merged
    : never; // ^^^ Last parameter

export type NoStringIndex<T> = { [K in keyof T as string extends K ? never : K]: T[K] };
export type OnlyStringIndex<T> = { [K in keyof T as PropertyKey extends K ? never : string]: T[K] };

/**
 * https://github.com/millsp/ts-toolbelt/blob/master/sources/Object/Has.ts
 */
type List<A = any> = ReadonlyArray<A>;
type At<A, K extends PropertyKey> = A extends List
  ? number extends A['length']
    ? K extends number | `${number}`
      ? A[never] | undefined
      : undefined
    : K extends keyof A
      ? A[K]
      : undefined
  : unknown extends A
    ? unknown
    : K extends keyof A
      ? A[K]
      : undefined;
export type Has<O extends object, K extends PropertyKey, M, Match extends MatchBase = 'default'> = Is<
  At<O, K>,
  M,
  Match
>;
