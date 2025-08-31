import mockStorage from '../../__mocks__/storage';
import Cache from '../../src/modules/Cache';

describe('Cache class:', () => {
  let restoreStorage: () => void;
  let cache: Cache;

  beforeAll(() => {
    restoreStorage = mockStorage();
    cache = new Cache({ prefix: 'prefix', postfix: 'postfix' });
  });

  beforeEach(() => {
    cache.restart();
  });

  afterAll(() => {
    restoreStorage();
  });

  test('setCacheItem and getCacheItem', () => {
    cache.setCacheItem('test', { email: 'test@mail.ru' }, { place: 'localStorage' });
    expect(cache.getCacheItem('test')).toStrictEqual({ email: 'test@mail.ru' });
    expect(globalThis.localStorage.getItem('prefix--cache-postfix-test')).toStrictEqual(
      '{"expires":0,"value":{"email":"test@mail.ru"}}',
    );
  });
});
