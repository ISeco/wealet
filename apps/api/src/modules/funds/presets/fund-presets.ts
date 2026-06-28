import { FundClassification } from '../entities/fund.entity';
import { FundPresetType } from '../enums/fund-preset.enum';

interface FundPresetEntry {
  name: string;
  classification: FundClassification;
  isOperative: boolean;
  countsForRunway: boolean;
  frameworkSlot: string | null;
  targetPercentage: number | null;
}

export const FUND_PRESETS: Record<FundPresetType, FundPresetEntry[]> = {
  [FundPresetType.JARS_EKER]: [
    {
      name: 'Necesidades',
      classification: FundClassification.COMMITTED,
      isOperative: false,
      countsForRunway: false,
      frameworkSlot: 'jars_nec',
      targetPercentage: 55,
    },
    {
      name: 'Rico',
      classification: FundClassification.AVAILABLE,
      isOperative: true,
      countsForRunway: false,
      frameworkSlot: 'jars_ffa',
      targetPercentage: 10,
    },
    {
      name: 'Educación',
      classification: FundClassification.COMMITTED,
      isOperative: false,
      countsForRunway: false,
      frameworkSlot: 'jars_educ',
      targetPercentage: 10,
    },
    {
      name: 'Inversión',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
      frameworkSlot: 'jars_ltss',
      targetPercentage: 10,
    },
    {
      name: 'Emergencia',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
      frameworkSlot: 'jars_play',
      targetPercentage: 10,
    },
    {
      name: 'Dar',
      classification: FundClassification.AVAILABLE,
      isOperative: false,
      countsForRunway: false,
      frameworkSlot: 'jars_give',
      targetPercentage: 5,
    },
  ],
  [FundPresetType.RULE_50_30_20]: [
    {
      name: 'Necesidades',
      classification: FundClassification.COMMITTED,
      isOperative: false,
      countsForRunway: false,
      frameworkSlot: '50_30_20_committed',
      targetPercentage: 50,
    },
    {
      name: 'Deseos',
      classification: FundClassification.AVAILABLE,
      isOperative: true,
      countsForRunway: false,
      frameworkSlot: '50_30_20_available',
      targetPercentage: 30,
    },
    {
      name: 'Ahorro',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
      frameworkSlot: '50_30_20_reserve',
      targetPercentage: 20,
    },
  ],
  [FundPresetType.PROFIT_FIRST]: [
    {
      name: 'Estilo de Vida',
      classification: FundClassification.AVAILABLE,
      isOperative: true,
      countsForRunway: false,
      frameworkSlot: 'profit_first:estilo_de_vida',
      targetPercentage: 55,
    },
    {
      name: 'Diversión / Experiencias',
      classification: FundClassification.AVAILABLE,
      isOperative: false,
      countsForRunway: false,
      frameworkSlot: 'profit_first:diversion',
      targetPercentage: 10,
    },
    {
      name: 'Inversión / Ahorro',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
      frameworkSlot: 'profit_first:inversion',
      targetPercentage: 25,
    },
    {
      name: 'Seguridad / Impuestos',
      classification: FundClassification.RESERVE,
      isOperative: false,
      countsForRunway: true,
      frameworkSlot: 'profit_first:seguridad',
      targetPercentage: 10,
    },
  ],
};
