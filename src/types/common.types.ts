export type PartialRecursive<T> = {
  [P in keyof T]?: PartialRecursive<T[P]>;
};
export type RequiredRecursive<T> = {
  [P in keyof T]-?: RequiredRecursive<T[P]>;
};

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

// type UnionToObject<U extends string> = {
//   [K in U]: UnionToObject<Exclude<U, K>>;
// };

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
export type Include<Key extends PropertyKey, List extends PropertyKey, Value = true> =
  Key extends Extract<List, Key> ? Value : never;

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
export type Invert2<O extends Record<keyof O, Value>, Value extends PropertyKey = PropertyKey> = UnionToIntersection<
  {
    [K in keyof O]: Record<O[K], K>;
  }[keyof O]
>;

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
// type AppendExists<O extends object, LN extends List, I extends Iteration> =
//   Key<I> extends keyof O ? Append<LN, O[Key<I>]> : Pos<I> extends keyof O ? Append<LN, O[Pos<I>]> : LN;
// type ___ListOf<O extends object, K, LN extends List = [], I extends Iteration = IterationOf<0>> = {
//   0: ___ListOf<O, Exclude<K, Key<I>>, AppendExists<O, LN, I>, Next<I>>;
//   1: LN;
// }[Extends<[K], [never]>];
// type __ListOf<O extends object> = number extends keyof O
//   ? O[number][]
//   : string extends keyof O
//     ? O[string][]
//     : symbol extends keyof O
//       ? O[symbol][]
//       : ___ListOf<O, Select<keyof O, number | `${number}`>>;
// type _ListOf<O extends object> = __ListOf<O> extends infer X ? Cast<X, List> : never;
// type TPick<L extends ReadonlyArray<any>, K extends PropertyKey> = L extends unknown
//   ? _ListOf<_OPick<ObjectOf<L>, `${K & number}` | K>>
//   : never;
export type Select<O extends object, M, Match extends MatchBase = 'default'> = Pick<O, SelectKeys<O, M, Match>>;

/**
 * https://github.com/millsp/ts-toolbelt/blob/master/sources/List/Undefinable.ts
 */
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
// const _ = Symbol('x');
// type X = typeof _ & {};
// type Cast<A1, A2> = A1 extends A2 ? A1 : A2;
// type UReplace<U, M, A, Match extends MatchBase = 'default'> = U extends unknown
//   ? { 1: A; 0: U }[Is<U, M, Match>]
//   : never;
// type OUpdate<O extends object, K extends PropertyKey, A> = {
//   [P in keyof O]: P extends K ? UReplace<A, X, O[P]> : O[P];
// } & {};
// type LUpdate<L extends ReadonlyArray<any>, K extends PropertyKey, A> = Cast<
//   OUpdate<L, `${K & number}` | K, A>,
//   ReadonlyArray<any>
// >;
// export type Undefinable<L extends ReadonlyArray<any>, K extends PropertyKey = PropertyKey> = Cast<
//   LUpdate<L, `${K & number}` | K, X | undefined>,
//   ReadonlyArray<any>
// >;

/**
 * https://github.com/millsp/ts-toolbelt/blob/master/sources/Object/Required.ts
 */
// type DepthBase = 'flat' | 'deep';
// type BuiltIn = () => void | Error | Date | { readonly [Symbol.toStringTag]: string } | RegExp | Generator;
// type RequiredFlat<O> = {
//   [K in keyof O]-?: O[K];
// } & {};
// type RequiredDeep<O> = {
//   [K in keyof O]-?: O[K] extends BuiltIn ? O[K] : RequiredDeep<O[K]>;
// };
// type RequiredPart<O extends object, Depth extends DepthBase> = {
//   flat: RequiredFlat<O>;
//   deep: RequiredDeep<O>;
// }[Depth];
// type PatchProp<OK, O1K, Fill, OKeys extends PropertyKey, K extends PropertyKey> = K extends OKeys
//   ? OK extends Fill
//     ? O1K
//     : OK
//   : O1K;
// type PatchFlatObject<O extends object, O1 extends object, Fill, OKeys extends PropertyKey = keyof O> = {
//   [K in keyof (O & _Omit<O1, OKeys>)]: PatchProp<At<O, K>, At<O1, K>, Fill, OKeys, K>;
// } & {};
// type Has<L extends ReadonlyArray<any>, K extends PropertyKey, M, Match extends MatchBase = 'default'> = OHas<
//   ObjectOf<L>,
//   `${K & number}` | K,
//   M,
//   match
// >;
// type Longer<L extends ReadonlyArray<any>, L1 extends ReadonlyArray<any>> = L extends unknown
//   ? L1 extends unknown
//     ? { 0: 0; 1: 1 }[Has<keyof L, keyof L1>]
//     : never
//   : never;
// type PatchFlatList<L extends ReadonlyArray<any>, L1 extends ReadonlyArray<any>, Ignore extends object, Fill> =
//   number extends Length<L | L1>
//     ? PatchFlatChoice<L[number], L1[number], Ignore, Fill>[]
//     : Longer<L, L1> extends 1
//       ? { [K in keyof L]: PatchProp<L[K], At<L1, K>, Fill, keyof L, K> }
//       : { [K in keyof L1]: PatchProp<At<L, K>, L1[K], Fill, keyof L, K> };
// type PatchFlatChoice<O extends object, O1 extends object, Ignore extends object, Fill> = O extends Ignore
//   ? O
//   : O1 extends Ignore
//     ? O
//     : O extends List
//       ? O1 extends List
//         ? PatchFlatList<O, O1, Ignore, Fill>
//         : PatchFlatObject<O, O1, Fill>
//       : PatchFlatObject<O, O1, Fill>;
// type PatchFlat<O extends object, O1 extends object, Ignore extends object = BuiltIn, Fill = never> = O extends unknown
//   ? O1 extends unknown
//     ? PatchFlatChoice<O, O1, Ignore, Fill>
//     : never
//   : never;
// type ___ListOf<O extends object, K, LN extends List = [], I extends Iteration = IterationOf<0>> = {
//   0: ___ListOf<O, Exclude<K, Key<I>>, AppendExists<O, LN, I>, Next<I>>;
//   1: LN;
// }[Extends<[K], [never]>];
// type __ListOf<O extends object> = number extends keyof O
//   ? O[number][]
//   : string extends keyof O
//     ? O[string][]
//     : symbol extends keyof O
//       ? O[symbol][]
//       : ___ListOf<O, Select<keyof O, number | `${number}`>>;
// type _ListOf<O extends object> = __ListOf<O> extends infer X ? Cast<X, List> : never;
// export type Required<
//   O extends object,
//   K extends PropertyKey = PropertyKey,
//   Depth extends DepthBase = 'flat',
// > = O extends unknown ? PatchFlat<RequiredPart<_ListOf<_OPick<ObjectOf<O>, `${K & number}` | K>>, Depth>, O> : never;

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
export type NoDefaultIndex<T> = { [K in keyof T as PropertyKey extends K ? never : K]: T[K] };

// type NonNullable<T> = Exclude<T, null | undefined>;

// ------------------------------------------

// type FFF00B = Record<string, unknown>;
// interface FFF00 extends FFF00B {
//   name1: string;
//   name2: string;
// }
// type FFF0 = Record<string, { wanted?: keyof FFF00 | undefined; other: number }>;
// interface FFF extends FFF0 {
//   key1: { wanted: 'name1'; other: number };
//   key2: { other: number };
//   key3: { wanted: 'name2'; other: number };
// }
// type FF2<T extends FFF0> = Select<NoStringIndex<T>, { wanted: keyof FFF00 }, 'contains->'>;
// const ff: FF2<FFF> = { key1: { wanted: 'name1', other: 3 }, key3: { wanted: 'name2', other: 2 } };
// type FF3<T extends FFF0, TT extends FF2<T> = FF2<T>> = {
//   [K in keyof TT]-?: TT[K]['wanted'] extends keyof FFF00 ? TT[K]['wanted'] : keyof FFF00;
// };
// const ff3: FF3<FFF> = { key1: 'name1', key3: 'name2' };
// type FF4<T extends FFF0> = Invert<FF3<T>, keyof FFF00>;
// const ff2: FF4<FFF> = {};

// console.log(ff, ff2, ff3);
