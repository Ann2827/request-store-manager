import { Context, Logger, NamedLogger, ResponseFactory } from '@core';
import { convertQuery, crc32, fillObject } from '@utils';

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

type THttpsAnswer<T extends TTokenNames, H extends THttpsBase<T>, Key extends keyof H> = {
  response: Response;
  validData: H[Key][1] | null;
  data: unknown;
  validError: H[Key][2] | null;
  fetchData: IHttpsRequest<T>;
};
type THttpsState<T extends TTokenNames, H extends THttpsBase<T>> = {
  [K in keyof H as string]?: {
    status: 'pending' | 'stop';
    listeners: number;
    result?: THttpsAnswer<T, H, K>;
  };
};

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
  extends Context<THttpsState<T, H>>
  implements IModule
{
  readonly #config: { [K in keyof H]: THttpsConfigNamedRequest<T, H, K> };

  readonly #modules: THttpsModules<T, N>;

  readonly #settings: THttpsSettings;

  readonly #validation: Validation<[Response, IHttpsRequest<T>], THttpsValidationAdapter<T, H>>;

  readonly #namedLogger?: NamedLogger;

  #getFetchData<Name extends keyof H>(name: Name, ...args: Parameters<H[Name][0]>): IHttpsRequest<T> {
    const config = this.#config[name];
    return config?.request(...args);
  }

  async #normalizeRequest(
    fetchData: IHttpsRequest<T>,
    authHeader: [string, string] | null,
  ): Promise<{
    body: BodyInit | null | undefined;
    headers: HeadersInit;
    method: string | undefined;
    input: string | URL | globalThis.Request;
  }> {
    const headers = new Headers(fetchData.init?.headers);
    const input = new URL(fetchData.url);
    let body = fetchData.init?.body;

    if (authHeader) {
      headers.append(...authHeader);
    }
    if (fetchData.body) {
      const format = fetchData.settings?.contentType ?? this.#settings.contentType;
      body = ResponseFactory.stringify(fetchData.body, format);
      const contentType = ResponseFactory.requestContentType(format);
      if (contentType) headers.append('Content-Type', contentType);
    }
    if (fetchData.query) {
      Object.entries(convertQuery(fetchData.query)).forEach(([key, value]) => {
        input.searchParams.append(key, value);
      });
    }
    const method = fetchData.method ?? fetchData.init?.method;

    return {
      body,
      headers,
      method,
      input,
    };
  }

  #interceptedAnswer<Name extends keyof H>(stateKey: string): Promise<THttpsAnswer<T, H, Name>> {
    return new Promise((resolve) => {
      const clean = super.subscribe((state) => {
        const result = state[stateKey]?.result as THttpsAnswer<T, H, Name> | undefined;
        if (result) {
          clean();
          super.setState((prev) => {
            if (!prev[stateKey]?.listeners || prev[stateKey]?.listeners === 1)
              return { ...prev, [stateKey]: { status: prev[stateKey]?.status, listeners: 0 } };
            return { ...prev, [stateKey]: { ...prev[stateKey], listeners: prev[stateKey].listeners - 1 } };
          });
          resolve(result);
        }
      });
    });
  }

  constructor(
    config: IHttpsConfig<T, H>,
    modules: THttpsModules<T, N>,
    settings?: Partial<THttpsSettings>,
    logger?: Logger,
  ) {
    const namedLogger = logger?.named(MODULE_NAME);
    super({}, namedLogger);

    this.#settings = {
      contentType: settings?.contentType ?? 'json',
      loader: settings?.loader ?? false,
      notifications: settings?.notifications ?? false,
    };
    this.#modules = modules;
    this.#namedLogger = namedLogger;
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
    Object.values(this.#modules).forEach((module) => module?.restart());
    super.restart();
    this.#namedLogger?.restart();
  }

  public async namedRequest<Name extends keyof H>(
    name: Name,
    ...args: Parameters<H[Name][0]>
  ): Promise<THttpsAnswer<T, H, Name>> {
    const stateKey = `${name.toString()}-${crc32([...args].join(''))}`;

    if (this.state[stateKey]?.status === 'pending') {
      super.setState((prev) => ({
        ...prev,
        [stateKey]: { ...prev[stateKey], listeners: prev[stateKey]!.listeners + 1 },
      }));
      return this.#interceptedAnswer<Name>(stateKey);
    }
    super.setState((prev) => ({ ...prev, [stateKey]: { listeners: 0, status: 'pending', answer: undefined } }));

    const fetchData = this.#getFetchData<Name>(name, ...args);
    // TODO: если нужны расширенные mock, то добавить тут

    this.#namedLogger?.message(`NamedRequest started for ${name.toString()}`);
    if (fetchData.settings?.loader ?? this.#settings.loader) this.#modules.loader.activate();

    let authHeader = null;
    if (fetchData.tokenName) {
      authHeader = await this.#modules.token.getAuthHeader(fetchData.tokenName);
      if (!authHeader) {
        this.#namedLogger?.error(`Token ${fetchData.tokenName.toString()} not found`);
        this.#namedLogger?.message(`NamedRequest aborted for ${name.toString()}`);
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
    }

    const { body, headers, method, input } = await this.#normalizeRequest(fetchData, authHeader);
    const response = await this.#modules.request.fetch(
      input,
      { ...fetchData.init, body, headers, method },
      name.toString(),
    );
    const data = await ResponseFactory.parse(response, fetchData.settings?.contentType ?? this.#settings.contentType);

    const message = this.#modules.messages.parse(response);
    if (message && (fetchData.settings?.notifications ?? this.#settings.notifications))
      this.#modules.notifications.send({ data: message[0], type: message[1], response });

    const { validData, validError } = this.#validation.parse<Name>(name, data, response, fetchData);

    this.#namedLogger?.message(`NamedRequest finished for ${name.toString()}`);
    if (fetchData.settings?.loader ?? this.#settings.loader) this.#modules.loader.determinate();

    const answer = { response, validData, data, validError, fetchData };
    super.setState((prev) => ({
      ...prev,
      [stateKey]: { ...prev[stateKey], result: prev[stateKey]?.listeners ? answer : undefined, status: 'stop' },
    }));
    return answer;
  }
}

export default Https;
