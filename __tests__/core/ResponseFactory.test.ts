import mockResponse from '../../__mocks__/response';
import ResponseFactory from '../../src/core/response/ResponseFactory';

describe('ResponseFactory class:', () => {
  let restoreResponse: () => void;
  let response: Response;

  beforeAll(() => {
    restoreResponse = mockResponse();
    response = new Response(JSON.stringify({ email: 'test@mail.ru' }), {
      status: 200,
      statusText: 'OK',
    });
  });

  afterAll(() => {
    restoreResponse();
  });

  test('json', async () => {
    const data = await ResponseFactory.parse(response, 'json');
    expect(data).toStrictEqual({ email: 'test@mail.ru' });
  });

  test('text', async () => {
    const data = await ResponseFactory.parse(response, 'text');
    expect(data).toStrictEqual('{"email":"test@mail.ru"}');
  });
});
