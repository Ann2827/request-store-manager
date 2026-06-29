import { convertQuery } from '../../src/utils/fetchHandle';

describe('utils fetchHandle: fn:', () => {
  test('convertQuery', () => {
    expect(
      convertQuery({ a: 1, b: 'text', c: true, d: false, e: { k: 1 }, f: [1, 2], j: null, k: undefined }, {}),
    ).toEqual({ a: '1', b: 'text', c: 'true', d: 'false', 'e[k]': '1', f: '[1,2]' });
    expect(
      convertQuery(
        { a: 1, b: 'text', c: true, d: false, e: { k: 1 }, f: [1, 2], j: null, k: undefined },
        { allowEmptyQuery: true },
      ),
    ).toEqual({ a: '1', b: 'text', c: 'true', d: 'false', 'e[k]': '1', f: '[1,2]', j: '', k: '' });
    expect(
      convertQuery(
        { a: 1, b: 'text', c: true, d: false, e: { k: 1 }, f: [1, 2], j: null, k: undefined },
        { allowQueryNull: 'none' },
      ),
    ).toEqual({ a: '1', b: 'text', c: 'true', d: 'false', 'e[k]': '1', f: '[1,2]', j: 'none' });
    expect(
      convertQuery(
        { a: 1, b: 'text', c: true, d: false, e: { k: 1 }, f: [1, 2], j: null, k: undefined },
        { allowEmptyQuery: true, allowQueryNull: 'null' },
      ),
    ).toEqual({ a: '1', b: 'text', c: 'true', d: 'false', 'e[k]': '1', f: '[1,2]', j: 'null', k: '' });
  });
});
