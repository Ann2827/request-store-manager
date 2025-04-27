import { type IHttpsRequest, type THttpsBase } from '@types';

import mockStorage from '../../__mocks__/storage';
import Store from '../../src/modules/Store';
import Conserve from '../../src/modules/Conserve';

type TTokens = 'main';
interface THttps extends THttpsBase<TTokens> {
  getTasks: [(quantity: number) => IHttpsRequest<TTokens>, { quantity: number }, any?];
}
type TStore = {
  tasks: { quantity: number };
};
type TConserve = {
  getTasks: 'tasks';
};

describe('Conserve class:', () => {
  let restoreStorage: () => void;
  let conserve: Conserve<TTokens, THttps, TStore, TConserve>;
  let store: Store<TStore>;

  beforeAll(() => {
    restoreStorage = mockStorage();

    store = new Store<TStore>({
      initialState: { tasks: { quantity: 0 } },
      isEmpty: { tasks: ({ quantity }) => !quantity },
    });
    conserve = new Conserve<TTokens, THttps, TStore, TConserve>(
      {
        getTasks: {
          storeKey: 'tasks',
          converter: () => ({ quantity: 5 }),
        },
      },
      { store },
    );
  });

  beforeEach(() => {
    conserve.restart();
  });

  afterAll(() => {
    restoreStorage();
  });

  test('save', () => {
    conserve.save('getTasks', { quantity: 2 }, { method: 'GET', url: 'https://test.com' });
    expect(store.get('tasks').quantity).toStrictEqual(5);
  });
});
