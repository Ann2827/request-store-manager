import type { TStoreBase } from '@types';

import mockStorage from '../../__mocks__/storage';
import Store from '../../src/modules/Store';
import CacheStrict from '../../src/modules/CacheStrict';

interface IStore extends TStoreBase {
  tasks: { backlog: string[]; done: string[] };
}

describe('Store class:', () => {
  let restoreStorage: () => void;
  let store: Store<IStore>;
  let cache: CacheStrict<keyof IStore>;

  beforeAll(() => {
    restoreStorage = mockStorage();
    cache = new CacheStrict<keyof IStore>({ tasks: { place: 'localStorage' } });
    store = new Store<IStore>({ initialState: { tasks: { backlog: [], done: [] } } }, { cache });
  });

  beforeEach(() => {
    store.restart();
  });

  afterAll(() => {
    restoreStorage();
  });

  test('set and get', async () => {
    store.set('tasks', (prev) => ({ ...prev, backlog: ['test'] }));
    const state = store.get('tasks');
    expect(state.backlog).toStrictEqual(['test']);

    expect(cache.get('tasks')).toStrictEqual({ backlog: ['test'], done: [] });
    expect(globalThis.localStorage.getItem('cache-tasks')).toStrictEqual(
      '{"expires":0,"value":{"backlog":["test"],"done":[]}}',
    );
  });
});
