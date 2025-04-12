import { stringify } from './stringify';

const getKey = (key: string, prefix: string): string => (prefix ? `${prefix}.${key}` : key);
const getStart = (prefix: string): string => (prefix ? `${prefix}:` : '');

export const getDiff = (data1: unknown, data2: unknown, prefix = ''): Array<[string, string]> => {
  const result: Array<[string, string]> = [];
  if (data1 === data2) return result;

  const [toWrite1, type1] = stringify(data1);
  const [toWrite2, type2] = stringify(data2);

  if (type1 === 'unknown' || type2 === 'unknown') return result;
  if (toWrite1 === toWrite2) return result;
  if (type1 !== type2 || type1 !== 'object' || type2 !== 'object') {
    result.push([getStart(prefix) + toWrite1, getStart(prefix) + toWrite2]);
    return result;
  }

  const keys1 = Object.keys(data1 as object).sort();
  const keys2 = Object.keys(data2 as object).sort();
  const commonKeys = keys1.map((key) => (keys2.includes(key) ? key : null)).filter((i) => i !== null);
  if (keys1.toString() !== keys2.toString()) {
    (keys1 as Array<keyof typeof data1>).forEach((key) => {
      if (commonKeys.includes(key)) return;
      getDiff((data1 as object)[key], undefined, getKey(key, prefix)).forEach((i) => {
        result.push(i);
      });
    });
    (keys2 as Array<keyof typeof data2>).forEach((key) => {
      if (commonKeys.includes(key)) return;
      getDiff(undefined, (data2 as object)[key], getKey(key, prefix)).forEach((i) => {
        result.push(i);
      });
    });
  }

  (commonKeys as Array<keyof typeof data1>).forEach((key) => {
    getDiff((data1 as object)[key], (data2 as object)[key], getKey(key, prefix)).forEach((i) => {
      result.push(i);
    });
  });

  return result;
};
