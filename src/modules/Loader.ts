import { Context, Logger } from '@core';
import { IModule } from '@types';

export const MODULE_NAME = 'loader';

/**
 * Перед каждыйм запросом запускайте activate. По завершении вызывайте determinate. Когда все запросы завершились active становится false.
 */
class Loader extends Context<{ active: boolean; quantity: number }> implements IModule {
  constructor(logger?: Logger) {
    super({ active: false, quantity: 0 }, logger?.named(MODULE_NAME));
  }

  public activate(): void {
    super.setState((prev) => ({ active: true, quantity: prev.quantity + 1 }));
  }

  public determinate(): void {
    if (super.state.quantity <= 1) {
      super.restart();
      return;
    }
    super.setState((prev) => ({ active: true, quantity: prev.quantity - 1 }));
  }
}

export default Loader;
