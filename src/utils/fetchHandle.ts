import { isObject } from '@utils';

import { stringify } from './stringify';

const getPairs = (obj: object): [string[], string][] => {
  return Object.entries(obj).reduce<[string[], string][]>((prev, [key, value]) => {
    if (value === null || value === undefined) return prev;

    if (isObject(value)) {
      getPairs(value).forEach(([keys, val]) => {
        prev.push([[key, ...keys], val.toString()]);
      });
    } else {
      prev.push([[key], stringify(value)[0]]);
    }

    return prev;
  }, []);
};
const calculateKey = ([key0, ...keysRest]: string[]) => [key0, ...keysRest.map((a) => `[${a}]`)].join('');
export const convertQuery = (object: object): Record<string, string> => {
  return Object.fromEntries(getPairs(object).map(([keys, value]) => [calculateKey(keys), value]));
};
