import mockStorage from '../../__mocks__/storage';
import CacheCurrent from '../../src/modules/CacheCurrent';

describe('CacheCurrent class:', () => {
  let restoreStorage: () => void;
  let cache: CacheCurrent<'test'>;

  beforeAll(() => {
    restoreStorage = mockStorage();
    cache = new CacheCurrent<'test'>('test', { place: 'localStorage' });
  });

  beforeEach(() => {
    cache.restart();
  });

  afterAll(() => {
    restoreStorage();
  });

  test('remove', () => {
    cache.set({ email: 'test@mail.ru' });
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(
      '{"expires":0,"value":{"email":"test@mail.ru"}}',
    );
    cache.remove();
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(null);
  });

  test('restart', () => {
    cache.set({ email: 'test@mail.ru' });
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(
      '{"expires":0,"value":{"email":"test@mail.ru"}}',
    );
    cache.restart();
    expect(globalThis.localStorage.getItem('cache-test')).toStrictEqual(null);
  });
});
