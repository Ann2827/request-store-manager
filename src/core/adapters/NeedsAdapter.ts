import { Needs } from '@modules';

import type {
  IManagerConfig,
  INeedsConfig,
  RequestManagerBase,
  THttpsAdapter,
  TNeedsAdapter,
  TNotificationsBase,
  TStoreBase,
  TTokenNames,
} from '@types';

import Logger from '../Logger';

import { IsFullRequestConfig } from './functions';

import type { TNeedsModules } from '../../modules/Needs';

class NeedsAdapter<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> extends Needs<T, S, THttpsAdapter<T, S, RM>, N, TNeedsAdapter<T, S, RM>> {
  constructor(
    config: IManagerConfig<T, S, RM, N>,
    modules: TNeedsModules<T, THttpsAdapter<T, S, RM>, S, N>,
    logger: Logger,
  ) {
    const needsConfig = Object.entries(config.namedRequests).reduce<INeedsConfig<T, THttpsAdapter<T, S, RM>, S>>(
      (prev, [hKey, value]) => {
        if (IsFullRequestConfig<T, S, RM, typeof hKey>(value) && value.store)
          return { ...prev, [value.store.key]: { requestName: hKey, converter: value.store.converter } };
        return prev;
      },
      {} as INeedsConfig<T, THttpsAdapter<T, S, RM>, S>,
    );
    super(needsConfig, modules, logger);
  }
}

export default NeedsAdapter;
