import type { TStoreBase } from '@types';

import mockStorage from '../../__mocks__/storage';
import Store from '../../src/modules/Store';
import CacheStrict from '../../src/modules/CacheStrict';
import CacheCurrent from '../../src/modules/CacheCurrent';

type TaskT = { description: string; title: string; id: number };
interface IStore extends TStoreBase {
  tasks: { backlog: string[]; done: string[] };
  array: { backlog: TaskT[]; done: TaskT[] };
}
type TFullStore = 'name';

describe('Store class:', () => {
  let restoreStorage: () => void;
  let store: Store<IStore>;
  let cache: CacheStrict<keyof IStore>;
  let cacheFull: CacheCurrent<TFullStore>;

  beforeAll(() => {
    restoreStorage = mockStorage();
    cache = new CacheStrict<keyof IStore>({ tasks: { place: 'localStorage' } });
    cacheFull = new CacheCurrent<TFullStore>('name', { place: 'localStorage' });
    store = new Store<IStore>(
      { initialState: { tasks: { backlog: [], done: [] }, array: { backlog: [], done: [] } } },
      { cache, cacheFull },
    );
  });

  beforeEach(() => {
    globalThis.localStorage.clear();
    store.restart();
  });

  afterAll(() => {
    restoreStorage();
  });

  test('set and get and cacheStrict', async () => {
    store.set('tasks', (prev) => ({ ...prev, backlog: ['test'] }));
    const state = store.get('tasks');
    expect(state.backlog).toStrictEqual(['test']);

    expect(cache.get('tasks')).toStrictEqual({ backlog: ['test'], done: [] });
    expect(globalThis.localStorage.getItem('cache-tasks')).toStrictEqual(
      '{"expires":0,"value":{"backlog":["test"],"done":[]}}',
    );
  });

  test('set array', () => {
    store.set('array', () => ({
      backlog: [
        { description: 'cillum officia eiusmod aliqua', id: 123, title: 'consequat dolor culpa' },
        { description: 'cillum officia eiusmod aliqua', id: 1234, title: 'consequat dolor culpa' },
        { description: 'cillum officia eiusmod aliqua', id: 2, title: 'consequat dolor culpa' },
      ],
      done: [],
    }));
    expect(store.state.array.backlog.length).toStrictEqual(3);

    store.set('array', (prev) => ({
      ...prev,
      backlog: [
        ...prev.backlog,
        { description: 'cillum officia eiusmod aliqua', id: 24, title: 'consequat dolor culpa' },
      ],
    }));
    expect(store.state.array.backlog.length).toStrictEqual(4);
  });

  test('restore from cacheCurrent', () => {
    globalThis.localStorage.setItem(
      'cache-name',
      '{"expires":0,"value":{"tasks":{"backlog":["2"],"done":[]},"array":{"backlog":[],"done":[]}}}',
    );
    const state = store.getFull();
    expect(state.tasks.backlog).toStrictEqual(['2']);
  });

  test('setFull and getFull and cacheCurrent', async () => {
    store.setFull((prev) => ({ ...prev, tasks: { ...prev.tasks, backlog: ['1'] } }));
    const state = store.getFull();
    expect(state.tasks.backlog).toStrictEqual(['1']);

    expect(cacheFull.get()).toStrictEqual({ tasks: { backlog: ['1'], done: [] }, array: { backlog: [], done: [] } });
    expect(globalThis.localStorage.getItem('cache-name')).toStrictEqual(
      '{"expires":0,"value":{"tasks":{"backlog":["1"],"done":[]},"array":{"backlog":[],"done":[]}}}',
    );
  });
});
