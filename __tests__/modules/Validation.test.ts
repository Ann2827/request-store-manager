import { ResponseFactory } from '@core';

import type { IHttpsRequest, THttpsBase, TValidationTemplate } from '@types';

import mockResponse from '../../__mocks__/response';
import Validation from '../../src/modules/Validation';

type TTokens = 'main';
interface THttps extends THttpsBase<TTokens> {
  getTasks: [(quantity: number) => IHttpsRequest<TTokens>, { quantity: number }, { message: string }];
}

interface THttpsValidationTemplate<T extends TTokens, Valid, Error>
  extends TValidationTemplate<[Response, IHttpsRequest<T>]> {
  isSuccess?: (data: unknown, response: Response, fetchData: IHttpsRequest<T>) => data is Valid;
  isError?: (data: unknown, response: Response, fetchData: IHttpsRequest<T>) => data is Error;
  onSuccess?: (props: { validData: Valid }, response: Response, fetchData: IHttpsRequest<T>) => void;
  onError?: (
    props: {
      validError: Error | null;
      data: unknown;
    },
    response: Response,
    fetchData: IHttpsRequest<T>,
  ) => void;
}
type THttpsValidationAdapter<T extends TTokens, H extends THttpsBase<T>> = {
  [K in keyof H]: THttpsValidationTemplate<T, H[K][1], H[K][2]>;
};

describe('Validation class:', () => {
  let restoreResponse: () => void;
  let validation: Validation<[Response, IHttpsRequest<TTokens>], THttpsValidationAdapter<TTokens, THttps>>;
  let onSuccess: false | THttps['getTasks'][1];
  let onError: false | THttps['getTasks'][2] | null;

  beforeAll(() => {
    restoreResponse = mockResponse();
    validation = new Validation<[Response, IHttpsRequest<TTokens>], THttpsValidationAdapter<TTokens, THttps>>({
      getTasks: {
        isSuccess: (data: unknown, response: Response): data is THttps['getTasks'][1] =>
          response?.ok && !!data && typeof data === 'object' && 'quantity' in data && typeof data.quantity === 'number',
        isError: (data, response): data is THttps['getTasks'][2] =>
          !!data && typeof data === 'object' && 'message' in data && typeof data.message === 'string',
        onSuccess: ({ validData }) => {
          onSuccess = validData;
        },
        onError({ validError }) {
          onError = validError;
        },
      },
    });
  });

  beforeEach(() => {
    validation.restart();
    onSuccess = false;
    onError = false;
  });

  afterAll(() => {
    restoreResponse();
  });

  test('parse success', async () => {
    const response = new Response(
      JSON.stringify({
        quantity: 1,
      }),
      {
        status: 200,
        statusText: 'OK',
      },
    );
    const data = await ResponseFactory.parse(response, 'json');
    const { validData } = validation.parse<'getTasks'>('getTasks', data, response, {
      url: '',
      method: 'GET',
    });
    expect(validData).toStrictEqual({ quantity: 1 });
    expect(onSuccess).toStrictEqual({ quantity: 1 });
  });

  test('parse error', async () => {
    const response = new Response(
      JSON.stringify({
        message: 'Test',
      }),
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );
    const data = await ResponseFactory.parse(response, 'json');
    const { validError } = validation.parse<'getTasks'>('getTasks', data, response, {
      url: '',
      method: 'GET',
    });
    expect(validError).toStrictEqual({ message: 'Test' });
    expect(onError).toStrictEqual({ message: 'Test' });
  });
});
