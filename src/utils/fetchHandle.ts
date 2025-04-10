import { isObject, replace } from '@utils';

const getPairs = (obj: object): [string[], string][] => {
  return Object.entries(obj).reduce<[string[], string][]>((prev, [key, value]) => {
    if (value === null || value === undefined) return prev;

    if (isObject(value)) {
      getPairs(value).forEach(([keys, val]) => {
        prev.push([[key, ...keys], val.toString()]);
      });
    } else {
      prev.push([[key], value.toString()]);
    }

    return prev;
  }, []);
};
const calculateKey = ([key0, ...keysRest]: string[]) => [key0, ...keysRest.map((a) => `[${a}]`)].join('');
export const convertQuery = (object: object): Record<string, string> => {
  return Object.fromEntries(getPairs(object).map(([keys, value]) => [calculateKey(keys), value]));
};

export const fetchHandle = (
  url: string | URL,
  init: RequestInit = {},
  options: Partial<IHttpsFetchOptions> = {},
): [URL, RequestInit | undefined] => {
  const headers = new Headers(init.headers);
  const input = new URL(url);
  let body = init.body;

  if (options.body) {
    body = JSON.stringify(options.body);
    headers.append('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.append(...tokenVariant(options.token, options.tokenTemplate));
  }
  if (options.query) {
    Object.entries(convertQuery(options.query)).forEach(([key, value]) => {
      input.searchParams.append(key, value);
    });
  }

  return [input, { ...init, body, headers }];
};
