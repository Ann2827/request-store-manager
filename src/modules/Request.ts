import type { IModule, IRequestConfig, TRequestSettings } from '@types';

import { stringify } from '../utils/stringify';

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
class Request implements IModule {
  readonly #mockFn: IRequestConfig['mockFn'];

  readonly #settings: TRequestSettings;

  #fetchFn(name?: string, ...args: Parameters<typeof globalThis.fetch>): ReturnType<typeof globalThis.fetch> {
    if (!this.#settings.mockMode) return globalThis.fetch(...args);

    const response = this.#mockFn?.(name, ...args) || getDefaultResponse();
    return new Promise<Response>((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, this.#settings.mockDelay * 1000);
    });
  }

  constructor(config: IRequestConfig, settings?: Partial<TRequestSettings>) {
    this.#settings = { mockMode: settings?.mockMode ?? false, mockDelay: settings?.mockDelay || 1 };
    this.#mockFn = config.mockFn;
  }

  public restart(): void {}

  public async fetch(input: RequestInfo | URL, init?: RequestInit, name?: string): Promise<Response> {
    let response: Response;
    try {
      response = await this.#fetchFn(name, input, init);
    } catch (error: any) {
      response = getDefaultResponse(error);
    }

    return response;
  }
}

export default Request;
