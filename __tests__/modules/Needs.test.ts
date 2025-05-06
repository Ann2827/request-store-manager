import {
  NeedsActionTypes,
  type IHttpsRequest,
  type THttpsBase,
  type TNeedsBase,
  type TNotificationsBase,
} from '@types';

import mockResponse from '../../__mocks__/response';
import mockFetch from '../../__mocks__/fetch';
import mockStorage from '../../__mocks__/storage';
import Https from '../../src/modules/Https';
import Loader from '../../src/modules/Loader';
import Messages from '../../src/modules/Messages';
import Notifications from '../../src/modules/Notifications';
import Request from '../../src/modules/Request';
import Token from '../../src/modules/Token';
import Timer from '../../src/modules/Timer';
import Needs from '../../src/modules/Needs';
import Store from '../../src/modules/Store';
import Conserve from '../../src/modules/Conserve';

type TTokens = 'main';
interface THttps extends THttpsBase<TTokens> {
  getTasks: [(quantity: number) => IHttpsRequest<TTokens>, { quantity: number }, any?];
}
type TStore = {
  tasks: { quantity: number };
  zero: boolean;
};
interface INeeds extends TNeedsBase<TTokens, TStore, THttps> {
  tasks: 'getTasks';
}
type TConserve = {
  getTasks: 'tasks';
};

describe('Needs class:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  let restoreStorage: () => void;
  let needs: Needs<TTokens, THttps, TStore, TNotificationsBase, TConserve, INeeds>;
  let token: Token<TTokens>;
  let store: Store<TStore>;

  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();
    restoreStorage = mockStorage();
    const timer = new Timer();
    token = new Token({ main: 'bearer' }, { timer });
    store = new Store<TStore>({
      initialState: { tasks: { quantity: 0 }, zero: false },
      isEmpty: { tasks: ({ quantity }) => !quantity },
    });
    needs = new Needs<TTokens, THttps, TStore, TNotificationsBase, TConserve, INeeds>(
      { tasks: 'getTasks', zero: undefined },
      {
        store,
        conserve: new Conserve<TTokens, THttps, TStore, TConserve>(
          {
            getTasks: {
              storeKey: 'tasks',
            },
          },
          { store },
        ),
        https: new Https<TTokens, THttps>(
          {
            getTasks: (quantity: number) => ({
              url: 'https://test.com/' + quantity,
              method: 'GET',
              tokenName: 'main',
            }),
          },
          {
            request: new Request(
              {
                mockFn(name, input, init) {
                  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
                  const quantity = Number(url.split('/').reverse()[0]);
                  return new Response(
                    JSON.stringify({
                      quantity,
                    }),
                    {
                      status: 200,
                      statusText: 'OK',
                    },
                  );
                },
              },
              { mockMode: true },
            ),
            loader: new Loader(),
            token,
            messages: new Messages(),
            notifications: new Notifications({ timer }),
          },
        ),
      },
    );
  });

  beforeEach(() => {
    needs.restart();
    token.setToken('main', '123');
  });

  afterAll(() => {
    restoreResponse();
    restoreFetch();
    restoreStorage();
  });

  test('action', async () => {
    await needs.action('tasks', NeedsActionTypes.request, 1);
    expect(needs.get('tasks')).toStrictEqual(true);
    expect(store.get('tasks').quantity).toStrictEqual(1);
  });
});
