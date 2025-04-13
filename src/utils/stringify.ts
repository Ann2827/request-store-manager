import { isObject, isArray, isBoolean, isNull, isNumber, isString, isUndefined, isFunction } from './guards';
import { stringifyFunction } from './object';

type DataType = 'object' | 'number' | 'array' | 'boolean' | 'null' | 'string' | 'undefined' | 'function' | 'unknown';

const getType = (data: unknown): DataType => {
  if (isUndefined(data)) return 'undefined';
  if (isNull(data)) return 'null';
  if (isString(data)) return 'string';
  if (isNumber(data)) return 'number';
  if (isBoolean(data)) return 'boolean';
  if (isObject(data)) return 'object';
  if (isArray(data)) return 'array';
  if (isFunction(data)) return 'function';
  return 'unknown';
};

const toWrite = (data: unknown, type: Exclude<DataType, 'unknown'>): string => {
  switch (type) {
    case 'array':
    case 'object':
    case 'function': {
      return JSON.stringify(data, stringifyFunction);
    }
    case 'number':
    case 'boolean': {
      return (data as number | boolean).toString();
    }
    case 'undefined': {
      return '';
    }
    case 'null': {
      return 'null';
    }
    default: {
      return data as string;
    }
  }
};

export const stringify = (data: unknown): [string, DataType] => {
  const type = getType(data);
  if (type === 'unknown') return ['', 'unknown'];
  return [toWrite(data, type), type];
};
