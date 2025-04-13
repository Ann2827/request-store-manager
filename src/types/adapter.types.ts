import type { Invert, NoStringIndex, Select, SelectKeys } from './common.types';
import type { RequestManagerBase } from './manager.types';
import type { IHttpsRequest, TStoreBase, TTokenNames } from './modules';

// export type TStoreAdapter<T extends TTokenNames, RM extends RequestManagerBase<T>> = {
//   [K in keyof RM[keyof RM]['store']]: RM[keyof RM]['store'][K];
// };

// export type TStoreComparison<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
//     [K in keyof S]: RM[keyof RM]['storeKey'] extends K ?
// };

export type THttpsAdapter<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [K in keyof RM]: [(...args: Parameters<RM[K]['fn']>) => IHttpsRequest<T>, RM[K]['success'], RM[K]['error']];
};

type TNeedsSelectStore<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = Select<
  NoStringIndex<RM>,
  { storeKey: keyof S },
  'contains->'
>;
export type TNeedsAdapter0<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = Invert<
  {
    [K in keyof TNeedsSelectStore<T, S, RM>]-?: TNeedsSelectStore<T, S, RM>[K]['storeKey'] extends keyof S
      ? TNeedsSelectStore<T, S, RM>[K]['storeKey']
      : keyof S;
  },
  keyof S
>;
export type TNeedsAdapter<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
  [K in keyof S]: SelectKeys<NoStringIndex<RM>, { storeKey: K }, 'contains->'>;
};

// type TNeedsAdapter2<T extends TTokenNames, S extends TStoreBase, RM extends RequestManagerBase<T, S>> = {
//   [KS in keyof S]: SelectKeys<
//     {
//       [KH in keyof NoStringIndex<RM>]: RM[KH]['storeKey'];
//     },
//     KS,
//     'equals'
//   >;
// };

// interface TT1 extends TStoreBase {
//   k: number;
//   zero: null;
// }
// interface TT2 extends RequestManagerBase<'main', TT1> {
//   getTest: {
//     fn: () => IHttpsRequest<'main'>;
//     success: boolean;
//     storeKey: 'k';
//   };
//   getZero: {
//     fn: () => IHttpsRequest<'main'>;
//     success: boolean;
//     storeKey: 'zero';
//   };
//   getNon: {
//     fn: () => IHttpsRequest<'main'>;
//     success: boolean;
//   };
// }
// type TT3<T extends TTokenNames, S extends TStoreBase, T2 extends RequestManagerBase<T, S>> = Record<keyof S, keyof T2>;
// type TT4<
//   T extends TTokenNames,
//   S extends TStoreBase,
//   T2 extends RequestManagerBase<T, S>,
//   T3 extends TT3<T, S, T2>,
// > = T3;
// type TT5 = TT4<'main', TT1, TT2, TNeedsAdapter0<'main', TT1, TT2>>;

// const z: TT5 = { zero: 'getZero' };
// const z2: TNeedsAdapter<'main', TT1, TT2> = { k: 'getTest', zero: 'getZero' };
// const z3: TNeedsAdapter2<'main', TT1, TT2> = { k: 'getTest' };
// console.log(z, z2, z3);
