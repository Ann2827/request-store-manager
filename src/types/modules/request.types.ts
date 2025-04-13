export type TRequestSettings = {
  /**
   * @default false
   */
  mockMode: boolean;

  /**
   * Искуственная задержка ответа в секундах. (Работает при mockMode: true)
   * @default 1
   */
  mockDelay: number;
};

export interface IRequestConfig {
  mockFn?: (name?: string, ...params: Parameters<typeof globalThis.fetch>) => Response | undefined;
}
