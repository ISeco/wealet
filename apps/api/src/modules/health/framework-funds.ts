import { FundClassification } from '../funds/entities/fund.entity';
import { HealthFramework } from './entities/health-profile.entity';

export interface FundTemplate {
  slot: string;
  name: string;
  classification: FundClassification;
  targetPercentage: number;
  isOperative: boolean;
  countsForRunway: boolean;
}

export const FRAMEWORK_FUND_TEMPLATES: Record<HealthFramework, FundTemplate[]> =
  {
    [HealthFramework.FIFTY_THIRTY_TWENTY]: [
      {
        slot: '50_30_20_committed',
        name: 'Necesidades',
        classification: FundClassification.COMMITTED,
        targetPercentage: 50,
        isOperative: false,
        countsForRunway: false,
      },
      {
        slot: '50_30_20_available',
        name: 'Deseos',
        classification: FundClassification.AVAILABLE,
        targetPercentage: 30,
        isOperative: true,
        countsForRunway: false,
      },
      {
        slot: '50_30_20_reserve',
        name: 'Ahorro',
        classification: FundClassification.RESERVE,
        targetPercentage: 20,
        isOperative: false,
        countsForRunway: true,
      },
    ],
    [HealthFramework.JARS_EKER]: [
      {
        slot: 'jars_nec',
        name: 'Necesidades',
        classification: FundClassification.COMMITTED,
        targetPercentage: 55,
        isOperative: false,
        countsForRunway: false,
      },
      {
        slot: 'jars_ffa',
        name: 'Rico',
        classification: FundClassification.AVAILABLE,
        targetPercentage: 10,
        isOperative: true,
        countsForRunway: false,
      },
      {
        slot: 'jars_educ',
        name: 'Educación',
        classification: FundClassification.COMMITTED,
        targetPercentage: 10,
        isOperative: false,
        countsForRunway: false,
      },
      {
        slot: 'jars_ltss',
        name: 'Inversión',
        classification: FundClassification.RESERVE,
        targetPercentage: 10,
        isOperative: false,
        countsForRunway: true,
      },
      {
        slot: 'jars_play',
        name: 'Emergencia',
        classification: FundClassification.RESERVE,
        targetPercentage: 10,
        isOperative: false,
        countsForRunway: true,
      },
      {
        slot: 'jars_give',
        name: 'Dar',
        classification: FundClassification.AVAILABLE,
        targetPercentage: 5,
        isOperative: false,
        countsForRunway: false,
      },
    ],
    [HealthFramework.PROFIT_FIRST]: [
      {
        slot: 'profit_first:estilo_de_vida',
        name: 'Estilo de Vida',
        classification: FundClassification.AVAILABLE,
        targetPercentage: 55,
        isOperative: true,
        countsForRunway: false,
      },
      {
        slot: 'profit_first:diversion',
        name: 'Diversión / Experiencias',
        classification: FundClassification.AVAILABLE,
        targetPercentage: 10,
        isOperative: false,
        countsForRunway: false,
      },
      {
        slot: 'profit_first:inversion',
        name: 'Inversión / Ahorro',
        classification: FundClassification.RESERVE,
        targetPercentage: 25,
        isOperative: false,
        countsForRunway: true,
      },
      {
        slot: 'profit_first:seguridad',
        name: 'Seguridad / Impuestos',
        classification: FundClassification.RESERVE,
        targetPercentage: 10,
        isOperative: false,
        countsForRunway: true,
      },
    ],
    [HealthFramework.FONDOS]: [],
  };

/** Returns the slot prefix used to identify funds belonging to a framework. */
export function frameworkSlotPrefix(framework: HealthFramework): string {
  if (framework === HealthFramework.FIFTY_THIRTY_TWENTY) return '50_30_20_';
  if (framework === HealthFramework.JARS_EKER) return 'jars_';
  if (framework === HealthFramework.PROFIT_FIRST) return 'profit_first:';
  return '';
}
