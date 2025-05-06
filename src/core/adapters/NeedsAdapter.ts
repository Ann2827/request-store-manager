import { Needs } from '@modules';
import { fillObject } from '@utils';

import type {
  IManagerConfig,
  RequestManagerBase,
  TConserveAdapter,
  THttpsAdapter,
  TNeedsAdapter,
  TNeedsBase,
  TNotificationsBase,
  TStoreBase,
  TTokenNames,
} from '@types';

import Logger from '../Logger';

import { IsFullStoreConfig } from './functions';

import type { TNeedsModules } from '../../modules/Needs';

class NeedsAdapter<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> extends Needs<
  T,
  THttpsAdapter<T, S, RM>,
  S,
  N,
  TConserveAdapter<T, S, RM>,
  TNeedsBase<T, S, THttpsAdapter<T, S, RM>>
> {
  constructor(
    config: IManagerConfig<T, S, RM, N>,
    modules: TNeedsModules<T, THttpsAdapter<T, S, RM>, S, N, TConserveAdapter<T, S, RM>>,
    logger: Logger,
  ) {
    const needsConfig: TNeedsAdapter<T, S, RM> = fillObject<
      IManagerConfig<T, S, RM, N>['store'],
      TNeedsAdapter<T, S, RM>
    >(config.store, (value, key) => {
      if (IsFullStoreConfig<T, S, RM, typeof key>(value) && !!value?.autoRequest) return value?.autoRequest;
    });

    super(needsConfig, modules, logger);
  }
}

export default NeedsAdapter;
