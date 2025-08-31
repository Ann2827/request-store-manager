import type { IHttpsRequest, THttpsBase } from '@types';

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

type TTokens = 'main';
interface THttps extends THttpsBase<TTokens> {
  getTasks: [(quantity: number) => IHttpsRequest<TTokens>, { quantity: number }, any?];
}

describe('Https class:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  let restoreStorage: () => void;
  let https: Https<TTokens, THttps>;
  let token: Token<TTokens>;

  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();
    restoreStorage = mockStorage();

    const timer = new Timer();
    const request = new Request(
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
    );
    token = new Token({ main: 'bearer' }, { timer });
    https = new Https<TTokens, THttps>(
      {
        getTasks: (quantity: number) => ({
          url: 'https://test.com/' + quantity,
          method: 'GET',
          tokenName: 'main',
        }),
      },
      {
        request,
        loader: new Loader(),
        token,
        messages: new Messages(),
        notifications: new Notifications({ timer }),
      },
    );
  });

  beforeEach(() => {
    https.restart();
    token.setToken('main', '123');
  });

  afterAll(() => {
    restoreResponse();
    restoreFetch();
    restoreStorage();
  });

  test('namedRequest', async () => {
    const { validData, data } = await https.namedRequest('getTasks', 1);
    expect(validData).toStrictEqual({ quantity: 1 });
    expect(data).toStrictEqual({ quantity: 1 });
  });

  test('different double namedRequest', async () => {
    const [answer1, answer2] = await Promise.all([
      https.namedRequest('getTasks', 1),
      https.namedRequest('getTasks', 2),
    ]);
    expect(answer1.validData).toStrictEqual({ quantity: 1 });
    expect(answer2.validData).toStrictEqual({ quantity: 2 });
  });

  test('same double namedRequest', async () => {
    const [answer1, answer2] = await Promise.all([
      https.namedRequest('getTasks', 1),
      https.namedRequest('getTasks', 1),
    ]);
    expect(answer1.validData).toStrictEqual({ quantity: 1 });
    expect(answer2.validData).toStrictEqual({ quantity: 1 });
  });
});
