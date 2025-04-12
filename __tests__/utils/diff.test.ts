import { getDiff } from '../../src/utils/diff';

describe('utils diff: fn:', () => {
  test('should be return simple diff', () => {
    expect(getDiff(null, null)).toEqual([]);
    expect(getDiff(null, true)).toEqual([['null', 'true']]);
    expect(getDiff(['test'], null)).toEqual([['["test"]', 'null']]);
    expect(getDiff('test', 'key')).toEqual([['test', 'key']]);
    expect(getDiff({ a: '1' }, null)).toEqual([[JSON.stringify({ a: '1' }), 'null']]);
  });

  test('should be return diff for obj', () => {
    expect(getDiff({ a: '1' }, { a: '2' })).toEqual([['a:1', 'a:2']]);
    expect(getDiff({ a: '1' }, { a: null })).toEqual([['a:1', 'a:null']]);
    expect(getDiff({ a: '1' }, { a: '1', b: '1' })).toEqual([['b:undefined', 'b:1']]);
    expect(getDiff({ a: '1' }, { b: '1' })).toEqual([
      ['a:1', 'a:undefined'],
      ['b:undefined', 'b:1'],
    ]);
    expect(getDiff({ a: { b: '1' } }, { a: { b: '2' } })).toEqual([['a.b:1', 'a.b:2']]);
  });

  test('should be return diff for obj functions', () => {
    expect(getDiff({ a: {} }, { a: { f: () => true } })).toEqual([['a.f:undefined', 'a.f:"() => true"']]);
    expect(
      getDiff(
        { a: {} },
        {
          a: {
            f() {
              return false;
            },
          },
        },
      ),
    ).toEqual([['a.f:undefined', 'a.f:"f() {return false;}"']]);
  });
});
