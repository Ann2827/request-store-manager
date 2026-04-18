import type { TNotificationsBase } from './notifications.types';

export interface IMessagesConfig<N extends TNotificationsBase> {
  codes?: Record<string | number, N>;
  getOriginalError?: (response: Response, data: unknown) => string | number | undefined;
}
