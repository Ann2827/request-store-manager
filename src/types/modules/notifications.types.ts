export type TNotificationsBase = Partial<Record<'title' | 'text' | 'action', string>>;

export type TNotificationType = 'error' | 'warning' | 'success' | 'info';
export type TNotificationsSettings = {
  /**
   * Уведомление не закрывается автоматически
   * @default false
   */
  sticky: boolean;

  /**
   * Длительность показа в секундах. (Для сообщений со sticky: true)
   */
  duration: number;

  /**
   * Если было отправлено несколько уведомлений с одинаковым набором данных (data). Нужно ли показать дубликаты или только одно из них.
   * @default false
   */
  duplicate: boolean;
};
export type TNotification<N extends TNotificationsBase> = {
  data: N;
  type: TNotificationType;
  id: number;
  drop: () => void;
  //   response?: Response;
  //   dataJson?: any;
};
