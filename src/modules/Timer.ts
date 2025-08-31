import { Context, Logger, type NamedLogger } from '@core';

import type { IModule, TTimer, TTimerOptions } from '@types';

export const MODULE_NAME = 'timer';

/**
 * Модуль для работы с таймерами. Имеет отслеживаемый и тихий режимы.
 */
class Timer extends Context<Record<string, number>> implements IModule {
  readonly #namedLogger?: NamedLogger;

  #timers: Record<string, TTimer>;

  #onDone(name: string): void {
    const timer = this.#timers[name];
    timer.options.callback?.(timer.options.params);

    this.clearTimer(name);
  }

  #startTimeout(time: number, name: string, options: TTimerOptions = {}): void {
    super.setState((prev) => ({ ...prev, [name]: time }));
    this.#timers[name] = { type: 'timeout', options, clear: setTimeout(() => this.#onDone(name), time * 1000) };
  }

  #startInterval(time: number, name: string, options: TTimerOptions = {}): void {
    super.setState((prev) => ({ ...prev, [name]: time }));
    this.#timers[name] = {
      type: 'interval',
      options,
      clear: setInterval(() => {
        const leftTime = Number(super.state[name]);
        if (leftTime > 0) {
          super.setState((prev) => ({ ...prev, [name]: leftTime - 1 }));
        } else {
          this.#onDone(name);
        }
      }, 1000),
    };
  }

  constructor(logger?: Logger) {
    const namedLogger = logger?.named(MODULE_NAME);
    super({}, namedLogger);

    this.#namedLogger = namedLogger;
    this.#timers = {};

    this.restart = this.restart.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.clearTimer = this.clearTimer.bind(this);
  }

  /**
   * Отменяет все активные таймеры и сбрасывает состояние до инициализации.
   */
  public restart(): void {
    Object.keys(this.#timers).forEach((name) => {
      this.clearTimer(name);
    });
    this.#timers = {};
    super.restart();
    this.#namedLogger?.restart();
  }

  /**
   * Запустить таймер
   * @returns функция отмены этого тймера
   */
  public setTimer(name: string, time: number, options?: TTimerOptions): () => void {
    if (time <= 0) {
      this.#namedLogger?.error(`setTimer ${name} is not set, time <= 0`);
      return () => {};
    }

    this.clearTimer(name);
    if (options?.observe) {
      this.#startInterval(time, name, options);
    } else {
      this.#startTimeout(time, name, options);
    }

    return () => this.clearTimer(name);
  }

  /**
   * Отменить таймер по имени
   */
  public clearTimer(name: string): void {
    const timer = this.#timers[name];
    super.setState((prev) => (prev[name] ? { ...prev, [name]: 0 } : prev));
    if (!timer) return;

    if (timer.type === 'timeout') clearTimeout(timer.clear);
    if (timer.type === 'interval') clearInterval(timer.clear);
    delete this.#timers[name];
  }
}

export default Timer;
