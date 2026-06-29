import { TQuerySettings } from '@types';

import { isObject } from './guards';
import { stringify } from './stringify';

const getPairs = (obj: object, settings: TQuerySettings): [string[], string][] => {
  const { allowEmptyQuery, allowQueryNull } = settings;
  return Object.entries(obj).reduce<[string[], string][]>((prev, [key, value]) => {
    if (value === null && allowQueryNull) {
      prev.push([[key], allowQueryNull]);
    } else if (value === undefined || (value === null && !allowQueryNull)) {
      if (allowEmptyQuery) {
        prev.push([[key], '']);
      } else {
        return prev;
      }
    } else if (isObject(value)) {
      getPairs(value, settings).forEach(([keys, val]) => {
        prev.push([[key, ...keys], val.toString()]);
      });
    } else {
      prev.push([[key], stringify(value)[0]]);
    }

    return prev;
  }, []);
};
const calculateKey = ([key0, ...keysRest]: string[]) => [key0, ...keysRest.map((a) => `[${a}]`)].join('');
export const convertQuery = (object: object, settings: TQuerySettings): Record<string, string> => {
  return Object.fromEntries(getPairs(object, settings).map(([keys, value]) => [calculateKey(keys), value]));
};
