import { NeedsActionTypes, type IHttpsRequest, type RequestManagerBase } from '@types';

import mockResponse from '../__mocks__/response';
import mockFetch from '../__mocks__/fetch';
import mockStorage from '../__mocks__/storage';
import RequestManager from '../src/RequestManager';
import { stringify } from '../src/utils/stringify';

type TTokens = 'main';
type TStore = {
  tasks: { backlog: string[]; done: string[] };
  zero: boolean;
  non: null;
};
interface RM extends RequestManagerBase<TTokens, TStore> {
  getTasks: {
    fn: (quantity: number) => IHttpsRequest<TTokens>;
    success: { data: { type: 'backlog' | 'done'; text: string }[]; quantity: number };
    storeKey: 'tasks';
  };
  getZero: {
    fn: () => IHttpsRequest<TTokens>;
    success: boolean;
    storeKey: 'zero';
  };
  postAuth: {
    fn: () => IHttpsRequest<TTokens>;
    success: boolean;
  };
}

describe('RequestManager class:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  let restoreStorage: () => void;
  let requestManager: RequestManager<TTokens, TStore, RM>;

  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();
    restoreStorage = mockStorage();
    requestManager = new RequestManager<TTokens, TStore, RM>({
      settings: {
        logger: false,
        notifications: {},
        cache: { prefix: 'test' },
        request: { mockMode: true },
        https: { notifications: false, loader: false },
        token: { waitTime: 0 },
        // needs: { waitRequest: true },
      },
      tokens: {
        main: {
          template: 'bearer',
          cache: {
            maxAge: 60 * 24,
          },
        },
      },
      store: {
        tasks: {
          default: { backlog: [], done: [] },
          cache: { maxAge: 0, place: 'sessionStorage' },
          autoRequest: 'getTasks',
          validation: (data): data is TStore['tasks'] =>
            !!data && typeof data === 'object' && 'backlog' in data && 'done' in data,
          isEmpty: (value) => value.backlog.length === 0 && value.done.length === 0,
        },
        zero: {
          default: false,
        },
        non: {
          default: null,
        },
      },
      namedRequests: {
        getTasks: {
          request: (quantity: number) => ({
            url: 'https://test.com/' + quantity,
            method: 'GET',
            tokenName: 'main',
          }),
          mock: (input, init) => {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const quantity = Number(url.split('/').reverse()[0]);
            return new Response(
              JSON.stringify({
                data: [
                  { type: 'backlog', text: 'task1' },
                  { type: 'done', text: 'tsak2' },
                ],
                quantity,
              }),
              {
                status: 200,
                statusText: 'OK',
              },
            );
          },
          parse: {
            isSuccess: (dataJson, response): dataJson is RM['getTasks']['success'] =>
              !!response?.ok && typeof dataJson === 'object',
            onSuccess() {
              requestManager
                .getModule('notifications')
                .send({ data: { text: 'Данные успешно получены.' }, type: 'success' });
            },
            onError({ validError }, response, fetchData) {
              if (!response.ok) return;
              if (validError)
                requestManager
                  .getModule('notifications')
                  .send({ data: { text: stringify(validError)[0] }, type: 'error' });
            },
          },
          save: {
            storeKey: 'tasks',
            converter: ({ state, validData }) => {
              const { backlog, done } = Object.groupBy(validData.data, ({ type }) => type);
              return { backlog: backlog?.map(({ text }) => text) || [], done: done?.map(({ text }) => text) || [] };
            },
            validation: (data): data is Store[RM['getTasks']['storeKey']] =>
              !!data && typeof data === 'object' && 'backlog' in data && 'done' in data,
            cache: { maxAge: 0, place: 'sessionStorage' },
            empty: (value) => {
              return value.backlog.length === 0 && value.done.length === 0;
            },
          },
          afterRequest: ({ response, input }) => {
            if (!response.ok) return;
            requestManager
              .getModule('notifications')
              .send({ data: { text: 'Данные успешно получены.' }, type: 'success' });
          },
        },
        getZero: {
          request: () => ({
            url: 'https://test.com/',
            method: 'GET',
            tokenName: 'main',
          }),
          save: {
            storeKey: 'zero',
            converter: ({ state, validData }) => state,
          },
        },
        postAuth: () => ({
          url: 'https://test.com/',
          method: 'GET',
          tokenName: 'main',
        }),
      },
      messages: {
        codes: {
          403: {
            title: 'errors.error403',
          },
          default: {
            title: 'errors.errorTitle',
          },
        },
      },
    });
  });

  beforeEach(() => {
    requestManager.restart();
    requestManager.setToken('main', '123');
  });

  afterAll(() => {
    restoreResponse();
    restoreFetch();
    restoreStorage();
  });

  test('connectLoader', () => {
    const state = requestManager.connectLoader();
    requestManager.getModule('loader').activate();
    expect(state.state.active).toBe(true);
  });

  test('namedRequest', async () => {
    const { validData } = await requestManager.namedRequest('getTasks', 1);
    expect(validData?.quantity).toStrictEqual(1);
  });

  test('needAction', async () => {
    await requestManager.needAction<'tasks'>('tasks', NeedsActionTypes.request, 1);
    // await requestManager.getModule('needs').action('tasks', NeedsActionTypes.request, '1');

    expect(requestManager.get('tasks')).toStrictEqual({ backlog: ['task1'], done: ['tsak2'] });
  });

  test('sendNotification', () => {
    requestManager.sendNotification({ data: { text: 'Данные успешно получены.' }, type: 'success' });
    expect(requestManager.getModule('notifications').state?.[0].data).toStrictEqual({
      text: 'Данные успешно получены.',
    });
  });

  test('subscribe', () => {
    let state = requestManager.getModule('store').state;
    const clean = requestManager.subscribe((next) => {
      state = next;
    });
    requestManager.set('zero', () => true);
    expect(state.zero).toStrictEqual(true);
    clean();
  });

  test('state', () => {
    requestManager.set('zero', () => true);
    expect(requestManager.state.zero).toStrictEqual(true);
  });
});
