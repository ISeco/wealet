import {
  ClassificationTargets,
  FinancialFrameworkStrategy,
} from './financial-framework.strategy';

export class FiftyThirtyTwentyStrategy implements FinancialFrameworkStrategy {
  getDefaultTargets(): ClassificationTargets {
    return { committed: 50, available: 30, reserve: 20 };
  }
}
