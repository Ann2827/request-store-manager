import { Logger, NamedLogger, ResponseFactory } from '@core';
import { convertQuery, fillObject } from '@utils';

import type {
  IHttpsConfig,
  IModule,
  THttpsBase,
  THttpsConfigNamedRequest,
  THttpsSettings,
  TNotificationsBase,
  TTokenNames,
} from '@types';

import Request from './Request';
import Token from './Token';
import Loader from './Loader';
import Messages from './Messages';
import Notifications from './Notifications';

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
  readonly #config: { [K in keyof H]: Required<THttpsConfigNamedRequest<T, H, K>> };

  readonly #modules: THttpsModules<T, N>;

  readonly #settings: THttpsSettings;

  readonly #namedLogger?: NamedLogger;

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
    const defaultValidationFn = (d: unknown, _r: Response): d is H[keyof H][1] => true;
    this.#config = fillObject<IHttpsConfig<T, H>, { [K in keyof H]: Required<THttpsConfigNamedRequest<T, H, K>> }>(
      config,
      (value, key) =>
        IsFullConfig<T, H, typeof key>(value)
          ? {
              request: value.request,
              validation: value?.validation
                ? (d, r): d is H[keyof H][1] => {
                    const valid = value.validation!(d, r);
                    if (!valid) this.#namedLogger?.error(`Not valid`);
                    return valid;
                  }
                : defaultValidationFn,
              afterRequest: value?.afterRequest || (() => {}),
            }
          : {
              request: value as H[typeof key][0],
              validation: defaultValidationFn,
              afterRequest() {},
            },
    );
  }

  public restart(): void {
    Object.values(this.#modules).forEach((module) => module.restart());
  }

  public async namedRequest<Name extends keyof H>(
    name: Name,
    ...args: Parameters<H[Name][0]>
  ): Promise<{ response: Response; validData: H[Name][1] | null; data: unknown }> {
    const config = this.#config[name];
    const fetchData = config.request(...args);

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
          data: {},
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
    const response = await this.#modules.request.fetch(input, { ...fetchData.init, body, headers }, name.toString());
    const data = await ResponseFactory.parse(this.#settings.contentType, response);

    const message = this.#modules.messages.parse(response);
    if (message && (fetchData.settings?.notifications ?? this.#settings.notifications))
      this.#modules.notifications.send({ data: message[0], type: message[1], response });

    const validData = config.validation(data, response);
    if (validData) config.afterRequest({ input, response });

    if (fetchData.settings?.loader ?? this.#settings.loader) this.#modules.loader.determinate();

    return { response, validData: validData ? data : null, data };
  }
}

export default Https;
