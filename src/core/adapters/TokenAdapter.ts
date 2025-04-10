import { CacheStrict, Token } from '@modules';
import { fillFromArrayFn4 } from '@utils';

import type {
  IManagerConfig,
  RequestManagerBase,
  TCacheOptions,
  TNotificationsBase,
  TStoreBase,
  TTokenNames,
  TTokenOption,
  TTokenTemplate,
} from '@types';

import Logger from '../Logger';
import { TTokenModules } from '../../modules/Token';

class TokenAdapter<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> extends Token<T> {
  constructor(config: IManagerConfig<T, S, RM, N>, modules: TTokenModules, logger: Logger) {
    const tokens = fillFromArrayFn4<Record<T, TTokenOption>, TTokenTemplate>(config.tokens, ({ template }) => template);
    const cacheTokens = fillFromArrayFn4<Record<T, TTokenOption>, boolean | Partial<TCacheOptions>>(
      config.tokens,
      ({ cache }) => cache ?? false,
    );

    super(
      tokens,
      {
        timer: modules.timer,
        cache: new CacheStrict<T>(cacheTokens, { ...config.settings?.cache, postfix: 'token' }, logger),
      },
      config.settings?.token,
      logger,
    );
  }
}

export default TokenAdapter;
