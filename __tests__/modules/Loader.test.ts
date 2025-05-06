import Loader from '../../src/modules/Loader';

describe('Loader class:', () => {
  let loader: Loader;

  beforeAll(() => {
    loader = new Loader();
  });

  beforeEach(() => {
    loader.restart();
  });

  test('activate', () => {
    loader.activate();
    expect(loader.state.active).toEqual(true);
    expect(loader.state.quantity).toEqual(1);
  });

  test('determinate', () => {
    loader.activate();
    expect(loader.state.quantity).toEqual(1);
    loader.determinate();
    expect(loader.state.quantity).toEqual(0);
  });

  test('restart', () => {
    loader.activate();
    loader.activate();
    expect(loader.state.quantity).toEqual(2);
    loader.restart();
    expect(loader.state.quantity).toEqual(0);
  });
});
