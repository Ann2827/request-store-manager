import type { IMessagesConfig, IModule, TNotificationsBase, TNotificationType } from '@types';

class Messages<N extends TNotificationsBase = TNotificationsBase> implements IModule {
  readonly #codes: IMessagesConfig<N>['codes'];

  constructor(config?: IMessagesConfig<N>) {
    this.#codes = config?.codes;
  }

  public restart() {}

  public parse(response: Response): [N, TNotificationType] | undefined {
    if (!this.#codes) return;

    const { default: errDefaultObj, ...codes } = this.#codes;
    const errCodeArr = Object.entries(codes).find(
      ([key]) =>
        (typeof key === 'number' && key === response.status) ||
        (typeof key === 'string' && key.split(';').some((i) => Number(i) === response.status)),
    );

    if (errCodeArr) return [{ ...errDefaultObj, ...errCodeArr[1] }, response.ok ? 'success' : 'error'];
    return response.ok ? undefined : [{ ...errDefaultObj }, 'error'];
  }
}

export default Messages;
