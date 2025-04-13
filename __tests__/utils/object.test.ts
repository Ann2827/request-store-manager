import { arrToStr, unflattenItem, unflatten, onlyPublic } from '../../src/utils/object';

describe('utils object: fn:', () => {
  test('arrToStr should be passed', () => {
    expect(arrToStr(['1', '2', '3'])).toEqual('1, 2, 3');
    expect(arrToStr(['1', '2', '3'], '.')).toEqual('1.2.3');
    expect(arrToStr(['1', '2', '3'], '')).toEqual('123');
    expect(arrToStr('123', '.')).toEqual('123');
  });

  test('unflattenItem should be passed', () => {
    const result = unflattenItem(['my', 'test', 'obj'], true);
    expect(result).toEqual({ my: { test: { obj: true } } });
  });

  test('unflatten should be passed', () => {
    const result = unflatten({ 'my.test.obj': true, counter: 0 }, '.');
    expect(result).toEqual({ my: { test: { obj: true } }, counter: 0 });
  });

  test('onlyPublic', () => {
    type TData = {
      _privateKey: string;
      publicKey: string;
      _privateFn(): void;
      publicFn(): void;
    };
    const data = onlyPublic<TData>({
      _privateKey: '',
      publicKey: '',
      _privateFn: () => {},
      publicFn: () => {},
    });

    expect(Object.keys(data)).not.toContain('_privateKey');
    expect(Object.keys(data)).not.toContain('_privateFn');
    expect(Object.keys(data).sort()).toEqual(['publicKey', 'publicFn'].sort());
  });

  // test('fillByArray', () => {
  //   expect(fillFromArray<'a' | 'b', boolean>(['a', 'b'], true)).toEqual({ a: true, b: true });
  // });
});
