import { Context, Logger, NamedLogger } from '@core';

import type { IModule, IRequestConfig, TRequestSettings } from '@types';

import { stringify } from '../utils/stringify';

type TRequestState = Record<string, { status: 'pending' | 'stop'; response: Response | null }>;

function getDefaultResponse(error?: any) {
  return new Response(JSON.stringify({}), {
    status: 503,
    statusText: stringify(error)[0] || 'Service Unavailable',
  });
}

export const MODULE_NAME = 'request';

/**
 * Fetch request с хранением логов и возможностью замокать ответ.
 */
class Request extends Context<TRequestState> implements IModule {
  readonly #mockFn: IRequestConfig['mockFn'];

  readonly #settings: TRequestSettings;

  readonly #namedLogger?: NamedLogger;

  #fetchFn(name?: string, ...args: Parameters<typeof globalThis.fetch>): ReturnType<typeof globalThis.fetch> {
    if (!this.#settings.mockMode) return globalThis.fetch(...args);

    const response = this.#mockFn?.(name, ...args) || getDefaultResponse();
    return new Promise<Response>((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, this.#settings.mockDelay * 1000);
    });
  }

  #needAbort(key: string): boolean {
    const state = super.state[key];
    if (!state || state.status === 'stop') {
      super.setState((prev) => ({ ...prev, [key]: { status: 'pending', response: null } }));
      return false;
    }

    this.#namedLogger?.warn(`Already pending. ${key}`);
    return true;
  }

  constructor(config: IRequestConfig, settings?: Partial<TRequestSettings>, logger?: Logger) {
    const namedLogger = logger?.named(MODULE_NAME);
    super({}, namedLogger);

    this.#namedLogger = namedLogger;
    this.#settings = { mockMode: settings?.mockMode ?? false, mockDelay: settings?.mockDelay || 1 };
    this.#mockFn = config.mockFn;
  }

  public async fetch(input: RequestInfo | URL, init?: RequestInit, name?: string): Promise<Response> {
    const key = name || (input instanceof globalThis.Request ? input.url : input instanceof URL ? input.href : input);
    if (this.#needAbort(key)) {
      return new Promise((resolve) => {
        const clear = super.subscribe((state) => {
          if (state[key].status === 'stop') {
            const response = state[key].response || getDefaultResponse();
            clear();
            resolve(response);
          }
        });
      });
    }

    let response: Response;
    try {
      response = await this.#fetchFn(name, input, init);
    } catch (error: any) {
      response = getDefaultResponse(error);
    }
    super.setState((prev) => ({ ...prev, [key]: { status: 'stop', response } }));

    return response;
  }
}

export default Request;
