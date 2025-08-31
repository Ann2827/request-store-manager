import mockResponse from '../../__mocks__/response';
import mockFetch from '../../__mocks__/fetch';
import Request from '../../src/modules/Request';
import ResponseFactory from '../../src/core/response/ResponseFactory';

describe('Request class:', () => {
  let restoreResponse: () => void;
  let restoreFetch: () => void;
  let request: Request;

  beforeAll(() => {
    restoreResponse = mockResponse();
    restoreFetch = mockFetch();

    const body = JSON.stringify({ quantity: 2 });
    request = new Request(
      {
        mockFn(name, input, init) {
          if (name === 'test') {
            return new Response(body, { status: 200, statusText: 'OK' });
          }
          if (name === 'test2') {
            return new Response(
              new ReadableStream<string>({
                start(controller) {
                  controller.enqueue(body);
                  controller.close();
                },
              }),
              {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/json', 'Content-Length': body.length.toString() },
              },
            );
          }
        },
      },
      { mockMode: true, mockDelay: 2 },
    );
  });

  beforeEach(() => {
    request.restart();
  });

  afterAll(() => {
    restoreResponse();
    restoreFetch();
  });

  test('fetch', async () => {
    const [response1, response2] = await Promise.all([
      request.fetch('https://test.com', {}, 'test'),
      request.fetch('https://test.com', {}, 'test'),
    ]);
    const data1 = await ResponseFactory.parse(response1, 'json');
    const data2 = await ResponseFactory.parse(response2, 'json');
    expect(data1).toStrictEqual({ quantity: 2 });
    expect(data2).toStrictEqual({ quantity: 2 });
  });

  test('fetch with stream', async () => {
    const [response1, response2] = await Promise.all([
      request.fetch('https://test.com', {}, 'test2'),
      request.fetch('https://test.com', {}, 'test2'),
    ]);
    const data1 = await ResponseFactory.parse(response1, 'json');
    const data2 = await ResponseFactory.parse(response2, 'json');
    expect(data1).toStrictEqual({ quantity: 2 });
    expect(data2).toStrictEqual({ quantity: 2 });
  });
});
