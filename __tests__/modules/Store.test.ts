import type { TStoreBase } from '@types';

import mockStorage from '../../__mocks__/storage';
import Store from '../../src/modules/Store';

interface IStore extends TStoreBase {
  tasks: { backlog: string[]; done: string[] };
}

describe('Store class:', () => {
  let restoreStorage: () => void;
  let store: Store<IStore>;

  beforeAll(() => {
    restoreStorage = mockStorage();
    store = new Store<IStore>({ initialState: { tasks: { backlog: [], done: [] } } });
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
  });
});
