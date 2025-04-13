export type TTimerType = 'timeout' | 'interval';
export type TTimer = {
  type: TTimerType;
  clear: NodeJS.Timeout;
  options: TTimerOptions;
};
export type TTimerOptions = {
  /**
   * When observed = false, then timer runs in the background. And change the state to 0 only upon completion.
   * @default false
   */
  observe?: boolean;
  /**
   * It can be called when the time runs out.
   * // | Promise<void>
   */
  callback?: (params?: unknown) => void;
  /**
   * If you want to get the params passed at the start after the time has elapsed
   */
  params?: unknown;
};
