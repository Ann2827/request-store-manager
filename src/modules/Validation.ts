import { Logger, type NamedLogger } from '@core';

import type { IModule, TValidationBase } from '@types';

export const MODULE_NAME = 'validation';

/**
 * Модуль валидации
 */
class Validation<A extends Array<any>, V extends TValidationBase<A>> implements IModule {
  readonly #config: V;

  readonly #namedLogger?: NamedLogger;

  constructor(config: V, logger?: Logger) {
    const namedLogger = logger?.named(MODULE_NAME);

    this.#config = { ...config };
    this.#namedLogger = namedLogger;
  }

  public restart() {}

  public parse<Name extends keyof V>(name: Name, data: unknown, ...args: A) {
    const validation = this.#config[name];

    let isValidError;
    const isValid = validation && validation.isSuccess ? validation.isSuccess?.(data, ...args) : true;
    if (!isValid) {
      isValidError = validation.isError?.(data, ...args);
    }

    const validData = isValid ? data : null;
    const validError = isValidError ? data : null;

    if (isValid) {
      validation.onSuccess?.({ validData }, ...args);
    } else {
      this.#namedLogger?.error(`Validation for ${name.toString()} was not successful.`);
      validation.onError?.({ validError, data }, ...args);
    }

    return { validData, validError };
  }
}

export default Validation;
