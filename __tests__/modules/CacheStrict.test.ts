import mockStorage from '../../__mocks__/storage';
import CacheStrict from '../../src/modules/CacheStrict';

describe('CacheStrict class:', () => {
  let restoreStorage: () => void;
  let cache: CacheStrict<'test' | 'test2'>;

  beforeAll(() => {
    restoreStorage = mockStorage();
    cache = new CacheStrict<'test' | 'test2'>({ test: { place: 'localStorage' }, test2: { place: 'localStorage' } });
  });

  beforeEach(() => {
    cache.restart();
  });

  afterAll(() => {
    restoreStorage();
  });

  test('remove', () => {
    cache.set('test', { email: 'test@mail.ru' });
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(
      '{"expires":0,"value":{"email":"test@mail.ru"}}',
    );
    cache.remove('test');
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(null);
  });

  test('restart', () => {
    cache.set('test', { email: 'test@mail.ru' });
    cache.set('test2', true);
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(
      '{"expires":0,"value":{"email":"test@mail.ru"}}',
    );
    expect(globalThis.localStorage.getItem('cache-test2')).toStrictEqual('{"expires":0,"value":true}');
    cache.restart();
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(null);
  });
});
