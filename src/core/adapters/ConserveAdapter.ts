import { fillFilterObject } from '@utils';

import type {
  IManagerConfig,
  RequestManagerBase,
  TConserveAdapter,
  TConserveConfig,
  THttpsAdapter,
  TManagerConfigFull,
  TNotificationsBase,
  TStoreBase,
  TTokenNames,
} from '@types';

import Logger from '../Logger';
import Conserve, { TConserveModules } from '../../modules/Conserve';

import { IsFullRequestConfig } from './functions';

class ConserveAdapter<
  T extends TTokenNames,
  S extends TStoreBase,
  RM extends RequestManagerBase<T, S>,
  N extends TNotificationsBase,
> extends Conserve<T, THttpsAdapter<T, S, RM>, S, TConserveAdapter<T, S, RM>> {
  constructor(config: IManagerConfig<T, S, RM, N>, modules: TConserveModules<S>, logger: Logger) {
    const conserveConfig: TConserveConfig<T, THttpsAdapter<T, S, RM>, S, TConserveAdapter<T, S, RM>> = fillFilterObject<
      { [K in keyof RM]: RM[K]['fn'] | TManagerConfigFull<T, S, RM, K> },
      TConserveConfig<T, THttpsAdapter<T, S, RM>, S, TConserveAdapter<T, S, RM>>
    >(config.namedRequests, (value, key) => {
      if (IsFullRequestConfig<T, S, RM, typeof key>(value) && value.save) return value.save;
      return;
    });
    super(conserveConfig, modules, logger);
  }
}

export default ConserveAdapter;
