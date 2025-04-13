import type { TResponseFormat } from '@core';

import type { TTokenNames } from './token.types';

export type THttpsSettings = {
  /**
   * @default json
   */
  contentType: TResponseFormat;
  /**
   * Дожидаться токена или вернуть сразуответ-ошибку TODO: может достаточно waitTime?
   */
  waitToken: boolean;
  loader: boolean;
  notifications: boolean;
};
export interface IHttpsRequest<T extends TTokenNames> {
  url: string | URL;
  method: RequestInit['method'];
  query?: Record<string, unknown>;
  body?: any;
  tokenName?: T;
  settings?: Partial<THttpsSettings>;
  init?: RequestInit;
}

export type THttpsBaseSuccess = any;
export type THttpsBase<T extends TTokenNames> = {
  [name: string]: [(...args: any) => IHttpsRequest<T>, THttpsBaseSuccess, any?];
};

export type THttpsConfigNamedRequest<T extends TTokenNames, H extends THttpsBase<T>, K extends keyof H> = {
  request: H[K][0];
  validation?: (data: unknown, response: Response) => data is H[K][1];
  afterRequest?: (props: { response: Response; input: unknown; validData: H[K][1] }) => void;
  // mock?: (params: IHttpsRequest<T>) => Response;
};
export type IHttpsConfig<T extends TTokenNames, H extends THttpsBase<T>> = {
  [K in keyof H]: H[K][0] | THttpsConfigNamedRequest<T, H, K>;
};
