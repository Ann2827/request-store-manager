import { Needs } from '@modules';
import { fillFilterObject, fillFilterObject2, fillObject } from '@utils';

import type {
  IManagerConfig,
  NoStringIndex,
  RequestManagerBase,
  SelectKeys,
  TConserveAdapter,
  THttpsAdapter,
  TManagerStore,
  TNeedsAdapter,
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
> extends Needs<T, THttpsAdapter<T, S, RM>, S, N, TConserveAdapter<T, S, RM>, TNeedsAdapter<T, S, RM>> {
  constructor(
    config: IManagerConfig<T, S, RM, N>,
    modules: TNeedsModules<T, THttpsAdapter<T, S, RM>, S, N, TConserveAdapter<T, S, RM>>,
    logger: Logger,
  ) {
    const needsConfig: TNeedsAdapter<T, S, RM> = fillFilterObject2<
      { [K in keyof S]: TManagerStore<T, S, RM, K> | S[K] },
      TNeedsAdapter<T, S, RM>
      // { [K in keyof S]: SelectKeys<NoStringIndex<RM>, { storeKey: keyof S }, 'contains->'> }
    >(config.store, (value, key) => {
      const is = IsFullStoreConfig<T, S, RM, typeof key>(value);
      return is ? value?.autoRequest : undefined;
    });
    super(needsConfig, modules, logger);
  }
}

export default NeedsAdapter;
