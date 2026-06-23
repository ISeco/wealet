import {
  ClassificationTargets,
  FinancialFrameworkStrategy,
} from './financial-framework.strategy';

export class FondosStrategy implements FinancialFrameworkStrategy {
  getDefaultTargets(): ClassificationTargets {
    return { committed: 40, available: 30, reserve: 30 };
  }
}
