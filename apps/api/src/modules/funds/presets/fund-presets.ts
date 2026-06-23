import { FundClassification } from '../entities/fund.entity';
import { FundPresetType } from '../enums/fund-preset.enum';

interface FundPresetEntry {
  name: string;
  classification: FundClassification;
  isOperative: boolean;
  countsForRunway: boolean;
}

export const FUND_PRESETS: Record<FundPresetType, FundPresetEntry[]> = {
  [FundPresetType.JARS_EKER]: [
    {
      name: 'Necesidades',
      classification: FundClassification.COMMITTED,
      isOperative: false,
      countsForRunway: false,
    },
    {
      name: 'Rico',
      classification: FundClassification.AVAILABLE,
      isOperative: true,
      countsForRunway: false,
    },
    {
      name: 'Educación',
      classification: FundClassification.COMMITTED,
      isOperative: false,
      countsForRunway: false,
    },
    {
      name: 'Inversión',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
    },
    {
      name: 'Emergencia',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
    },
    {
      name: 'Dar',
      classification: FundClassification.AVAILABLE,
      isOperative: false,
      countsForRunway: false,
    },
  ],
  [FundPresetType.RULE_50_30_20]: [
    {
      name: 'Necesidades',
      classification: FundClassification.COMMITTED,
      isOperative: false,
      countsForRunway: false,
    },
    {
      name: 'Deseos',
      classification: FundClassification.AVAILABLE,
      isOperative: true,
      countsForRunway: false,
    },
    {
      name: 'Ahorro',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
    },
  ],
  [FundPresetType.ENVELOPES]: [
    {
      name: 'Gastos Fijos',
      classification: FundClassification.COMMITTED,
      isOperative: false,
      countsForRunway: false,
    },
    {
      name: 'Gastos Variables',
      classification: FundClassification.AVAILABLE,
      isOperative: true,
      countsForRunway: false,
    },
    {
      name: 'Ahorro',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
    },
    {
      name: 'Fondo de Emergencia',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
    },
  ],
};
