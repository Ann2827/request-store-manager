import { Logger, NamedLogger, ResponseFactory } from '@core';
import { convertQuery, fillObject } from '@utils';

import type {
  IHttpsConfig,
  IHttpsRequest,
  IModule,
  THttpsBase,
  THttpsConfigNamedRequest,
  THttpsSettings,
  THttpsValidationAdapter,
  TNotificationsBase,
  TTokenNames,
} from '@types';

import Request from './Request';
import Token from './Token';
import Loader from './Loader';
import Messages from './Messages';
import Notifications from './Notifications';
import Validation from './Validation';

type THttpsModules<T extends TTokenNames, N extends TNotificationsBase> = {
  request: Request;
  token: Token<T>;
  loader: Loader;
  messages: Messages<N>;
  notifications: Notifications<N>;
};

export function IsFullConfig<T extends TTokenNames, H extends THttpsBase<T>, K extends keyof H>(
  payload: unknown,
): payload is THttpsConfigNamedRequest<T, H, K> {
  return typeof payload === 'object' && !!payload && 'request' in payload && typeof payload.request === 'function';
}

export const MODULE_NAME = 'https';

class Https<T extends TTokenNames, H extends THttpsBase<T>, N extends TNotificationsBase = TNotificationsBase>
  implements IModule
{
  readonly #config: { [K in keyof H]: THttpsConfigNamedRequest<T, H, K> };

  readonly #modules: THttpsModules<T, N>;

  readonly #settings: THttpsSettings;

  readonly #validation: Validation<[Response, IHttpsRequest<T>], THttpsValidationAdapter<T, H>>;

  readonly #namedLogger?: NamedLogger;

  #getFetchData<Name extends keyof H>(name: Name, ...args: Parameters<H[Name][0]>): IHttpsRequest<T> {
    const config = this.#config[name];
    return config.request(...args);
  }

  constructor(
    config: IHttpsConfig<T, H>,
    modules: THttpsModules<T, N>,
    settings?: Partial<THttpsSettings>,
    logger?: Logger,
  ) {
    this.#settings = {
      contentType: settings?.contentType ?? 'json',
      waitToken: settings?.waitToken ?? false,
      loader: settings?.loader ?? false,
      notifications: settings?.notifications ?? false,
    };
    this.#modules = modules;
    this.#namedLogger = logger?.named(MODULE_NAME);
    this.#config = fillObject<IHttpsConfig<T, H>, { [K in keyof H]: THttpsConfigNamedRequest<T, H, K> }>(
      config,
      (value, key) =>
        IsFullConfig<T, H, typeof key>(value)
          ? value
          : {
              request: value as H[typeof key][0],
            },
    );
    this.#validation = new Validation<[Response, IHttpsRequest<T>], THttpsValidationAdapter<T, H>>(
      fillObject<IHttpsConfig<T, H>, THttpsValidationAdapter<T, H>>(config, (value, key) =>
        IsFullConfig<T, H, typeof key>(value) && value.parse
          ? {
              ...value.parse,
            }
          : {},
      ),
      logger,
    );
  }

  public restart(): void {
    Object.values(this.#modules).forEach((module) => module.restart());
  }

  public async namedRequest<Name extends keyof H>(
    name: Name,
    ...args: Parameters<H[Name][0]>
  ): Promise<{
    response: Response;
    validData: H[Name][1] | null;
    data: unknown;
    validError: H[Name][2] | null;
    fetchData: IHttpsRequest<T>;
  }> {
    const fetchData = this.#getFetchData<Name>(name, ...args);

    if (fetchData.settings?.loader ?? this.#settings.loader) this.#modules.loader.activate();

    // TODO: если нужны расширенные mock, то добавить тут

    const headers = new Headers(fetchData.init?.headers);
    const input = new URL(fetchData.url);
    let body = fetchData.init?.body;

    if (fetchData.tokenName) {
      const authHeader = await this.#modules.token.getAuthHeader(
        fetchData.tokenName,
        fetchData.settings?.waitToken ?? this.#settings.waitToken,
      );
      if (!authHeader) {
        this.#namedLogger?.error(`Token ${fetchData.tokenName.toString()} not found`);
        if (fetchData.settings?.loader ?? this.#settings.loader) this.#modules.loader.determinate();
        return {
          response: new Response(JSON.stringify({}), {
            status: 401,
            statusText: 'Unauthorized',
          }),
          validData: null,
          validError: null,
          data: {},
          fetchData,
        };
      }
      headers.append(...authHeader);
    }
    if (fetchData.body) {
      body = JSON.stringify(fetchData.body);
      const contentType = ResponseFactory.requestContentType(
        fetchData.settings?.contentType ?? this.#settings.contentType,
      );
      if (contentType) headers.append('Content-Type', contentType);
    }
    if (fetchData.query) {
      Object.entries(convertQuery(fetchData.query)).forEach(([key, value]) => {
        input.searchParams.append(key, value);
      });
    }
    const init = { ...fetchData.init, body, headers };
    const response = await this.#modules.request.fetch(input, init, name.toString());
    const data = await ResponseFactory.parse(this.#settings.contentType, response);

    const message = this.#modules.messages.parse(response);
    if (message && (fetchData.settings?.notifications ?? this.#settings.notifications))
      this.#modules.notifications.send({ data: message[0], type: message[1], response });

    const { validData, validError } = this.#validation.parse<Name>(name, data, response, fetchData);

    if (fetchData.settings?.loader ?? this.#settings.loader) this.#modules.loader.determinate();

    return { response, validData, data, validError, fetchData };
  }
}

export default Https;
