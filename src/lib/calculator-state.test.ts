import { describe, expect, it } from 'vitest';

import {
  calculatorStateKey,
  parseCalculatorState,
  serializeCalculatorState,
  type CalculatorState
} from './calculator-state';

const state: CalculatorState = {
  calculatorMode: 'area',
  areaInputMode: 'dimensions',
  powderInput: '12,5',
  submittedPowderInput: '12,5',
  areaInput: '',
  widthInput: '4',
  widthUnit: 'm',
  heightInput: '250',
  heightUnit: 'cm',
  thicknessInput: '15',
  wasteMarginInput: '10',
  directAreaSubmitted: false,
  dimensionsAreaSubmitted: true
};

describe('calculator state persistence', () => {
  it('round-trips the useful calculator inputs and submitted state', () => {
    expect(parseCalculatorState(serializeCalculatorState(state))).toEqual(state);
  });

  it('rejects malformed or stale stored state', () => {
    expect(parseCalculatorState('{"version":1,"calculatorMode":"unknown"}')).toBeNull();
    expect(parseCalculatorState(JSON.stringify({ version: 2, ...state }))).toBeNull();
    expect(parseCalculatorState('not json')).toBeNull();
  });

  it('names state per Market Variant so independent variants do not overwrite one another', () => {
    expect(calculatorStateKey('knauf-goldband-e-be')).toBe('mix-it-calculator-knauf-goldband-e-be');
    expect(calculatorStateKey('knauf-goldband-e-uk')).not.toBe(
      calculatorStateKey('knauf-goldband-e-be')
    );
  });
});
