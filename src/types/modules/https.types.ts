import type { TResponseFormat } from '@core';

import { TValidationTemplate } from './validation.types';

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

export interface THttpsValidationTemplate<T extends TTokenNames, Valid, Error>
  extends TValidationTemplate<[Response, IHttpsRequest<T>]> {
  isSuccess?: (data: unknown, response: Response, fetchData: IHttpsRequest<T>) => data is Valid;
  isError?: (data: unknown, response: Response, fetchData: IHttpsRequest<T>) => data is Error;
  onSuccess?: (props: { validData: Valid }, response: Response, fetchData: IHttpsRequest<T>) => void;
  onError?: (
    props: {
      validError: Error | null;
      data: unknown;
    },
    response: Response,
    fetchData: IHttpsRequest<T>,
  ) => void;
}
export type THttpsValidationAdapter<T extends TTokenNames, H extends THttpsBase<T>> = {
  [K in keyof H]: THttpsValidationTemplate<T, H[K][1], H[K][2]>;
};

export type THttpsConfigNamedRequest<T extends TTokenNames, H extends THttpsBase<T>, K extends keyof H> = {
  request: H[K][0];
  parse?: THttpsValidationTemplate<T, H[K][1], H[K][2]>;
  // mock?: (params: IHttpsRequest<T>) => Response;
};
export type IHttpsConfig<T extends TTokenNames, H extends THttpsBase<T>> = {
  [K in keyof H]: H[K][0] | THttpsConfigNamedRequest<T, H, K>;
};
