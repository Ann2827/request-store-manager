import type { IHttpsRequest, RequestManagerBase } from '@types';

import { RequestManager } from '../src';

type TTokens = 'main';
enum EKeys {
  tasks = 'tasks',
  zero = 'zero',
}
type Store = {
  [EKeys.tasks]: { backlog: string[]; done: string[] };
  zero: boolean;
  non: null;
};
interface RM extends RequestManagerBase<TTokens, Store> {
  getTasks: {
    fn: (quantity: number) => IHttpsRequest<TTokens>;
    success: { data: { type: 'backlog' | 'done'; text: string }[]; quantity: number };
    storeKey: EKeys.tasks;
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
  let requestManager: RequestManager<TTokens, Store, RM>;

  beforeAll(() => {
    requestManager = new RequestManager<TTokens, Store, RM>({
      settings: {
        logger: false,
        notifications: {},
        cache: { prefix: 'test' },
        request: { mockMode: true },
        https: {
          waitToken: false,
          notifications: false,
          loader: false,
        },
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
      namedRequests: {
        getTasks: {
          request: (quantity: number) => ({
            url: 'https://test.com/' + quantity,
            method: 'GET',
            tokenName: 'main',
          }),
          validation: (dataJson, response): dataJson is RM['getTasks']['success'] =>
            !!response?.ok && typeof dataJson === 'object',
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
          store: {
            key: EKeys.tasks,
            default: { backlog: [], done: [] },
            // TODO: fix
            // converter: ({ state, validData }) => {
            //   const { backlog, done } = Object.groupBy(validData.data, ({ type }) => type);
            //   return { backlog: backlog?.map(({ text }) => text) || [], done: done?.map(({ text }) => text) || [] };
            // },
            validation: (data): data is Store[RM['getTasks']['storeKey']] =>
              !!data && typeof data === 'object' && 'backlog' in data && 'done' in data,
            cache: { maxAge: 0, place: 'sessionStorage' },
            empty: (value) => value.backlog.length === 0 && value.done.length === 0,
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
          store: {
            key: 'zero',
            default: false,
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
  });

  test('', () => {});
});
