import { HealthFramework } from '../entities/health-profile.entity';
import { FiftyThirtyTwentyStrategy } from './fifty-thirty-twenty.strategy';
import { FinancialFrameworkStrategy } from './financial-framework.strategy';
import { FondosStrategy } from './fondos.strategy';
import { JarsEkerStrategy } from './jars-eker.strategy';

const STRATEGIES: Record<HealthFramework, FinancialFrameworkStrategy> = {
  [HealthFramework.FIFTY_THIRTY_TWENTY]: new FiftyThirtyTwentyStrategy(),
  [HealthFramework.JARS_EKER]: new JarsEkerStrategy(),
  [HealthFramework.FONDOS]: new FondosStrategy(),
};

export function getFrameworkStrategy(
  framework: HealthFramework,
): FinancialFrameworkStrategy {
  return STRATEGIES[framework];
}
