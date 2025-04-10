import type { TNotificationsBase } from './notifications.types';

export interface IMessagesConfig<N extends TNotificationsBase> {
  codes?: Record<string | number, N>;
}
