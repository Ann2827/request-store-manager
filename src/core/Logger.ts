type Params<T extends (...args: any) => any> = T extends (a: any, ...args: infer P) => any ? P : never;

export type NamedLogger = ReturnType<Logger['named']>;

function styledTitle(text: string, colored = false): [string, string] {
  const style = 'font-weight: bold;' + (colored ? 'color: blue;' : '');
  return ['%c' + text, style];
}

function table(diff: [string, string][]) {
  return Object.fromEntries(
    diff.map(([prev, next]) => {
      const key = prev.split(':')[0];
      return [key, { prev: prev.replace(`${key}:`, ''), next: next.replace(`${key}:`, '') }];
    }),
  );
}

/**
 * Используется для логгирования изменений.
 */
class Logger {
  /**
   * Статус логов
   */
  readonly #logsOn: boolean;

  constructor(logsOn: boolean) {
    this.#logsOn = logsOn;
  }

  /**
   * Выводит расширенный лог изменения состояния.
   * @param name - название модуля
   */
  public state(name: string, prev: unknown, next: unknown, diff: [string, string][], listeners?: number): void {
    if (!this.#logsOn) return;

    console.log(...styledTitle(`Module: ${name}.`, true), 'State has changed');
    console.table(table(diff));

    console.groupCollapsed('Advanced info');
    console.log('Prev state:', prev);
    console.log('Next state:', next);
    if (listeners !== undefined) console.log(...styledTitle(`Active listeners: ${listeners.toString()}`));
    console.groupEnd();
  }

  /**
   * @param name - название модуля
   */
  public message(name: string, message: string, description?: unknown): void {
    if (!this.#logsOn) return;

    if (!description) {
      console.log(...styledTitle(`Module: ${name}.`, true), message);
      return;
    }

    console.groupCollapsed(...styledTitle(`Module: ${name}.`, true), message);
    console.log(description);
    console.groupEnd();
  }

  /**
   * Выводит сообщения вне зависимости от статуса логов.
   * @param name - название модуля
   */
  public warn(name: string, message: string): void {
    console.warn(...styledTitle(`Module: ${name}.`), message);
  }

  /**
   * Выводит сообщения вне зависимости от статуса логов.
   * @param name - название модуля
   */
  public error(name: string, message: string): void {
    console.error(...styledTitle(`Module: ${name}.`), message);
  }

  /**
   * @param name - название модуля
   */
  public restart(name: string): void {
    if (!this.#logsOn) return;
    console.log(...styledTitle(`Module: ${name}.`), 'Was restarted');
  }

  /**
   * Возвращает набор методов класса с заданным названием модуля.
   * @param name - название модуля
   */
  public named(name: string) {
    return {
      state: (...args: Params<Logger['state']>) => this.state(name, ...args),
      message: (...args: Params<Logger['message']>) => this.message(name, ...args),
      warn: (...args: Params<Logger['warn']>) => this.warn(name, ...args),
      error: (...args: Params<Logger['error']>) => this.error(name, ...args),
      restart: (...args: Params<Logger['restart']>) => this.restart(name, ...args),
    };
  }
}

export default Logger;
