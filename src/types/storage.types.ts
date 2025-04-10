export type TStorage = 'localStorage' | 'sessionStorage';

export interface IStorageBase {
  get name(): TStorage;
  check(): boolean;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  getKeys(): string[];
}
