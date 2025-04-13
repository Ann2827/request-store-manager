import mockStorage from '../../__mocks__/storage';
import Token from '../../src/modules/Token';
import Timer from '../../src/modules/Timer';

type TTokens = 'main';

describe('Token class:', () => {
  let restoreStorage: () => void;
  let token: Token<TTokens>;

  beforeAll(() => {
    restoreStorage = mockStorage();
    token = new Token<TTokens>({ main: 'bearer' }, { timer: new Timer() });
  });

  beforeEach(() => {
    token.restart();
  });

  afterAll(() => {
    restoreStorage();
  });

  test('setToken', () => {
    token.setToken('main', '123');
    expect(token.get('main')).toStrictEqual('123');
  });

  test('getAuthHeader', async () => {
    token.setToken('main', '123');
    const result = await token.getAuthHeader('main');
    expect(result).toStrictEqual(['Authorization', 'Bearer 123']);
  });
});
