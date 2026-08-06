import { browser } from '$app/environment';

import type { DimensionUnit } from './calculation/units';

const STATE_VERSION = 1;

export type CalculatorMode = 'powder' | 'area';
export type AreaInputMode = 'direct' | 'dimensions';

export type CalculatorState = {
  calculatorMode: CalculatorMode;
  areaInputMode: AreaInputMode;
  powderInput: string;
  submittedPowderInput: string;
  areaInput: string;
  widthInput: string;
  widthUnit: DimensionUnit;
  heightInput: string;
  heightUnit: DimensionUnit;
  thicknessInput: string;
  wasteMarginInput: string;
  directAreaSubmitted: boolean;
  dimensionsAreaSubmitted: boolean;
};

function isCalculatorMode(value: unknown): value is CalculatorMode {
  return value === 'powder' || value === 'area';
}

function isAreaInputMode(value: unknown): value is AreaInputMode {
  return value === 'direct' || value === 'dimensions';
}

function isDimensionUnit(value: unknown): value is DimensionUnit {
  return value === 'm' || value === 'cm';
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function calculatorStateKey(variantId: string): string {
  return `mix-it-calculator-${variantId}`;
}

export function serializeCalculatorState(state: CalculatorState): string {
  return JSON.stringify({ version: STATE_VERSION, ...state });
}

export function parseCalculatorState(serialized: string | null): CalculatorState | null {
  if (!serialized) return null;

  try {
    const value: unknown = JSON.parse(serialized);
    if (!isStringRecord(value) || value.version !== STATE_VERSION) return null;

    if (
      !isCalculatorMode(value.calculatorMode) ||
      !isAreaInputMode(value.areaInputMode) ||
      !isDimensionUnit(value.widthUnit) ||
      !isDimensionUnit(value.heightUnit) ||
      typeof value.powderInput !== 'string' ||
      typeof value.submittedPowderInput !== 'string' ||
      typeof value.areaInput !== 'string' ||
      typeof value.widthInput !== 'string' ||
      typeof value.heightInput !== 'string' ||
      typeof value.thicknessInput !== 'string' ||
      typeof value.wasteMarginInput !== 'string' ||
      typeof value.directAreaSubmitted !== 'boolean' ||
      typeof value.dimensionsAreaSubmitted !== 'boolean'
    ) {
      return null;
    }

    return {
      calculatorMode: value.calculatorMode,
      areaInputMode: value.areaInputMode,
      powderInput: value.powderInput,
      submittedPowderInput: value.submittedPowderInput,
      areaInput: value.areaInput,
      widthInput: value.widthInput,
      widthUnit: value.widthUnit,
      heightInput: value.heightInput,
      heightUnit: value.heightUnit,
      thicknessInput: value.thicknessInput,
      wasteMarginInput: value.wasteMarginInput,
      directAreaSubmitted: value.directAreaSubmitted,
      dimensionsAreaSubmitted: value.dimensionsAreaSubmitted
    };
  } catch {
    return null;
  }
}

export function readCalculatorState(variantId: string): CalculatorState | null {
  if (!browser) return null;

  return parseCalculatorState(localStorage.getItem(calculatorStateKey(variantId)));
}

export function saveCalculatorState(variantId: string, state: CalculatorState): void {
  if (browser) {
    localStorage.setItem(calculatorStateKey(variantId), serializeCalculatorState(state));
  }
}
