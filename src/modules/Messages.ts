import type { IMessagesConfig, IModule, TNotificationsBase, TNotificationType } from '@types';

class Messages<N extends TNotificationsBase = TNotificationsBase> implements IModule {
  readonly #codes: IMessagesConfig<N>['codes'];
  readonly #getOriginalError: IMessagesConfig<N>['getOriginalError'];

  constructor(config?: IMessagesConfig<N>) {
    this.#codes = config?.codes;
    this.#getOriginalError = config?.getOriginalError;
  }

  public restart() {}

  public parse(response: Response, data?: unknown): [N, TNotificationType] | undefined {
    if (!this.#codes) return;

    const code = this.#getOriginalError?.(response, data) ?? response.status;

    const { default: errDefaultObj, ...codes } = this.#codes;
    const errCodeArr = Object.entries(codes).find(
      ([key]) =>
        (typeof key === 'number' && key == code) || (typeof key === 'string' && key.split(';').some((i) => i == code)),
    );

    const isOk = code.toString()[0] === '2';
    if (errCodeArr) return [{ ...errDefaultObj, ...errCodeArr[1] }, isOk ? 'success' : 'error'];
    return isOk ? undefined : [{ ...errDefaultObj }, 'error'];
  }
}

export default Messages;
