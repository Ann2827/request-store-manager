import { Context, Logger, type NamedLogger } from '@core';

import type { IModule, TNotification, TNotificationsBase, TNotificationsSettings } from '@types';

import Timer from './Timer';

type TNotificationsModules = { timer: Timer };

const MODULE_NAME = 'notifications';

/**
 * Модуль для работы с уведомлениями.
 */
class Notifications<N extends TNotificationsBase = TNotificationsBase>
  extends Context<TNotification<N>[]>
  implements IModule
{
  readonly #modules: TNotificationsModules;

  readonly #settings: TNotificationsSettings;

  readonly #namedLogger?: NamedLogger;

  #lastID: number;

  #drop(id: number) {
    this.#modules.timer.clearTimer(`${MODULE_NAME}-${id}`);
    super.setState((prev) => prev.filter((item) => item.id !== id));
  }

  constructor(modules: TNotificationsModules, settings?: Partial<TNotificationsSettings>, logger?: Logger) {
    const namedLogger = logger?.named(MODULE_NAME);
    super([], namedLogger);

    this.#lastID = 0;
    this.#modules = modules;
    this.#settings = {
      sticky: settings?.sticky ?? false,
      duration: settings?.duration ?? 3,
      duplicate: settings?.duplicate ?? false,
    };
    this.#namedLogger = namedLogger;

    this.restart = this.restart.bind(this);
    this.send = this.send.bind(this);
  }

  public restart() {
    this.#lastID = 0;
    super.state.forEach(({ id }) => {
      this.#drop(id);
    });
    Object.values(this.#modules).forEach((module) => module.restart());
    super.restart();
  }

  /**
   * Отправить уведомление
   * @example notifications.send({ data: { title: 'Error', ... }, type?: 'error', sticky?: false, duration?: 10 })
   * @returns функцию удаления этого уведомления
   */
  public send(
    props: Omit<TNotification<N>, 'id' | 'drop'> & Partial<Pick<TNotificationsSettings, 'duration' | 'sticky'>>,
  ): () => void {
    const { type = 'error', data, duration, sticky } = props;

    const currentHash = JSON.stringify(data);

    if (!this.#settings.duplicate && super.state.some((item) => JSON.stringify(item.data) === currentHash)) {
      this.#namedLogger?.warn(`Notification not send. Thist is duplicate`);
      return () => {};
    }

    const currentID = this.#lastID + 1;
    const drop = () => this.#drop(currentID);
    super.setState((prev) => [...prev, { id: currentID, data, type, drop }]);
    this.#lastID = currentID;

    const time = duration ?? this.#settings.duration;
    if (!(sticky ?? this.#settings.sticky) && time) {
      this.#modules.timer.setTimer(`${MODULE_NAME}-${currentID}`, time, { callback: drop });
    }

    return drop;
  }
}

export default Notifications;
