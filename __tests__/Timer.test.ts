import { Timer } from '../src/modules';

describe('Timer class:', () => {
  let timerModule: Timer;

  beforeAll(() => {
    timerModule = new Timer();
  });

  beforeEach(() => {
    timerModule.restart();
  });

  test('should setTimer', async () => {
    let counter: number = 0;
    expect.assertions(2);
    const clearSubscribe = timerModule.subscribe((state) => {
      switch (counter) {
        case 0: {
          expect(state).toEqual({ test1: 2 });
          break;
        }
        case 1: {
          expect(state).toEqual({ test1: 0 });
          break;
        }
      }
      counter++;
    });
    await new Promise((resolve) => {
      timerModule.setTimer('test1', 2, {
        callback: () => {
          resolve(true);
        },
      });
    });

    clearSubscribe();
  });

  test('should observable setTimer', async () => {
    let counter: number = 0;
    expect.assertions(3);
    const clearSubscribe = timerModule.subscribe((state) => {
      switch (counter) {
        case 0: {
          expect(state).toEqual({ test1: 2 });
          break;
        }
        case 1: {
          expect(state).toEqual({ test1: 1 });
          break;
        }
        case 2: {
          expect(state).toEqual({ test1: 0 });
          break;
        }
      }
      counter++;
    });
    await new Promise((resolve) => {
      timerModule.setTimer('test1', 2, {
        observe: true,
        callback: () => {
          resolve(true);
        },
      });
    });

    clearSubscribe();
  });

  test('should clearTimer', async () => {
    expect.assertions(2);
    const clearSubscribe = timerModule.subscribe((state) => {
      expect(state).toBeTruthy();
    });
    await new Promise((resolve) => {
      const clearTimer = timerModule.setTimer('test1', 5, {
        observe: true,
      });
      clearTimer();
      resolve(true);
    });

    clearSubscribe();
  });
});
