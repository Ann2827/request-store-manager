import { getDiff } from '@utils';

import type { TSubscribeFn, TSetFn } from '@types';

import type { NamedLogger } from './Logger';

/**
 * Создает хранилище с возможностью подписаться на состояние.
 */
class Context<S extends object> {
  readonly #namedLogger?: NamedLogger;

  #state: S;

  #listeners: Array<TSubscribeFn<S>>;

  #event(nextState: S): void {
    this.#listeners.forEach((listener) => listener(nextState));
  }

  // Если не сработает getter в react, можно попробовать поиграться с проксированием
  // https://stackoverflow.com/questions/37973290/javascript-bind-method-does-not-work-on-getter-property
  // #createProxy() {
  //   Object.defineProperty(this, 'state', {
  //     get: function () {
  //       return this.#state;
  //     }.bind(this),
  //   });
  // }

  /**
   * Используется только для тестирования
   */
  protected __test() {
    return { listeners: this.#listeners };
  }

  constructor(initialState: S, namedLogger?: NamedLogger) {
    this.#state = { ...initialState };
    this.#listeners = [];
    this.#namedLogger = namedLogger;

    this.restart = () => {
      this.#listeners = [];
      this.#state = { ...initialState };
    };

    this.__test = this.__test.bind(this);
    this._getState = this._getState.bind(this);
    this.setState = this.setState.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  /**
   * В прошлый раз getter не срабатывал в react. Это альтернатива.
   * @private
   * @ignore
   */
  protected _getState<T extends S = S>(fn?: (state: S) => T): S | T {
    if (typeof fn === 'function') return fn(this.#state);
    return this.#state;
  }

  /**
   * Позволяет сброситься до состояния после инициализации. Переопределяется в constructor
   */
  public restart(): void {}

  public get state(): S {
    return this.#state;
  }

  /**
   * Изменяет состояние.
   * @example context.setState((prevState) => ({ ...prevState, test: 1 })) или context.setState({ test: 1 })
   */
  public setState(fn: TSetFn<S>): void {
    const thisState: S = { ...this.#state };
    const newState: S = typeof fn === 'function' ? fn(this._getState()) : { ...fn };
    const diffState = getDiff(thisState, newState);
    if (diffState.length === 0) return;

    this.#state = newState;
    this.#event(newState);
    this.#namedLogger?.state(thisState, newState, diffState, this.#listeners.length);
  }

  /**
   * Позволяет подписаться на состояние
   * @example
   *    const state = null;
   *    const clean = context.subscribe((nextState) => { state = nextState });
   *    clean();
   * @returns функцию очистки
   */
  public subscribe(fn: TSubscribeFn<S>): () => void {
    this.#listeners.push(fn);
    return () => (this.#listeners = this.#listeners.filter((listener) => listener !== fn));
  }
}

export default Context;
