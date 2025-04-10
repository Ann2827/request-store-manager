export const isObject = <T = Obj>(data: any): data is T =>
  typeof data === 'object' &&
  data !== null &&
  !Array.isArray(data) &&
  (Object.keys(data) as Array<keyof typeof data>).every(
    (key) => typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol',
  );

export const isBoolean = (data: any): data is boolean => typeof data === 'boolean';

export const isString = (data: any): data is string => typeof data === 'string';

export const isNull = (data: any): data is null => data === null;

export const isUndefined = (data: any): data is undefined => data === undefined;

export const isNumber = (data: any): data is number => typeof data === 'number';

export const isArray = (data: any): data is [] => Array.isArray(data);

export const isFunction = (data: any): data is void => typeof data === 'function';

export const assertsTest = 'test';
