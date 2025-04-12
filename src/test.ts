import { NoStringIndex, SelectKeys } from '@types';

type CStoreBase = Record<PropertyKey, unknown>;
type CRMBaseTemp<S extends CStoreBase> = { key?: keyof S | undefined; a: null };
type CRMBase<S extends CStoreBase> = Record<PropertyKey, CRMBaseTemp<S>>;
type CC2C<S extends CStoreBase, RM extends CRMBase<S>> = {
  [KS in keyof S]: SelectKeys<
    {
      [KH in keyof NoStringIndex<RM>]: RM[KH]['key'];
    },
    KS,
    'equals'
  >;
};

type CheckLight2<S extends CStoreBase, RM extends CRMBase<S>> = keyof S extends keyof CC2C<S, RM> ? RM : never;
export type CFinish<S extends CStoreBase, RM extends CRMBase<S>> = CheckLight2<S, RM>;

type CStore0 = {
  key1: string;
  key2: number;
  key3: null;
};
export interface CRM0 extends CRMBase<CStore0> {
  name1: { a: null; key: 'key1' };
  name2: { a: null; key: 'key2' };
  name3: { key: 'key3'; a: null };
  name4: { a: null };
}

// const store: CStore0 = { key1: '123e', key2: 0, key3: null };
// const check: CFinish<CStore0, CRM0> = {
//   name1: { a: null, key: 'key1' },
//   name2: { a: null, key: 'key3' },
// };
// const check2: CFinish<CStore0, CRM0> = {
//   name1: { a: null, key: 'key1' },
//   name2: { a: null, key: 'key2' },
//   name3: { a: null, key: 'key3' },
//   name4: { a: null },
// };
// const ccc2c: CC2C<CStore0, CRM0> = { key1: 'name1', key2: 'name2', key3: 'name3' };
// const ccc2c1: CC2C<CStore0, CRM0> = { key1: 'name1', key3: 'name3' };

export default '123';

/**
 * ======= manager.types =======
 */

// type FlatRM<T extends TTokenNames, RM extends RequestManagerBase<T>> = {
//   [K in keyof RM]: RM[K]['store'];
// };
// type ReverseMap<T extends Record<keyof T, keyof any>> = {
//   [K in keyof T as T[K]]: K;
// };
// type NeedsAdapter<T extends TTokenNames, RM extends RequestManagerBase<T>> = {
//   // [K in keyof StoreAdapter<T, RM>]: null;
//   // [K in keyof RM as RM[K]['store']]: { requestName: K; converts?: TNeedsConverterFn<S[K], H[keyof H][1]> }
// };

// interface TTT extends Template<'main'> {
//   fn: () => IHttpsRequest<'main'>;
//   store: { k: number; z: null };
// }
// const r: TTT = {
//   fn: () => ({ url: '', method: 'GET' }),
//   store: { k: 1, j: 2 },
// };

// type StoreAdapter0<T extends string, RM extends RequestManagerBase<T>> = UnionToIntersection<
//   RecordToUnion<RevealArray<GetSubRecord<RM, 'store'>, Required<Template<T>>['store']>>
// >;
