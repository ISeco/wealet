import {
  ClassificationTargets,
  FinancialFrameworkStrategy,
} from './financial-framework.strategy';

export class JarsEkerStrategy implements FinancialFrameworkStrategy {
  getDefaultTargets(): ClassificationTargets {
    return { committed: 65, available: 15, reserve: 20 };
  }
}
