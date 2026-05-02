/**
 * Calculation System
 * Handles field calculations: sum, difference, product, quotient, count, average, min, max, custom
 */

import type { CalculationRule, CalculationType } from './schema';

// =====================================================
// Built-in Calculation Functions
// =====================================================

export const calculations = {
  sum: (values: number[]): number => {
    return values.reduce((acc, val) => acc + val, 0);
  },

  difference: (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((acc, val) => acc - val);
  },

  product: (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((acc, val) => acc * val, 1);
  },

  quotient: (values: number[]): number => {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];
    return values.reduce((acc, val) => acc / val);
  },

  count: (values: unknown[]): number => {
    return values.filter((v) => v !== null && v !== undefined && v !== '').length;
  },

  average: (values: number[]): number => {
    if (values.length === 0) return 0;
    return calculations.sum(values) / values.length;
  },

  min: (values: number[]): number => {
    if (values.length === 0) return 0;
    return Math.min(...values);
  },

  max: (values: number[]): number => {
    if (values.length === 0) return 0;
    return Math.max(...values);
  },
};

// =====================================================
// Extract Numeric Values from Form Data
// =====================================================

function extractNumericValues(
  fieldIds: string[],
  formData: Record<string, unknown>
): number[] {
  const values: number[] = [];

  for (const fieldId of fieldIds) {
    const value = formData[fieldId];

    if (typeof value === 'number' && !isNaN(value)) {
      values.push(value);
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        values.push(parsed);
      }
    }
  }

  return values;
}

// =====================================================
// Perform Calculation
// =====================================================

export function calculate(
  rule: CalculationRule,
  formData: Record<string, unknown>
): number {
  const calculator = calculations[rule.type];

  if (!calculator) {
    console.warn(`Unknown calculation type: ${rule.type}`);
    return 0;
  }

  // For count, we use all values (including non-numeric)
  if (rule.type === 'count') {
    const values = rule.fieldIds.map((id) => formData[id]);
    const result = calculator(values);
    return rule.roundTo !== undefined ? roundTo(result, rule.roundTo) : result;
  }

  // For other calculations, extract numeric values
  const values = extractNumericValues(rule.fieldIds, formData);
  const result = calculator(values);

  return rule.roundTo !== undefined ? roundTo(result, rule.roundTo) : result;
}

// =====================================================
// Round to Decimal Places
// =====================================================

function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// =====================================================
// Evaluate Custom Formula
// =====================================================

export function evaluateCustomFormula(
  formula: string,
  formData: Record<string, unknown>,
  fieldIds: string[]
): number {
  try {
    // Replace field IDs with their values
    let parsedFormula = formula;

    for (const fieldId of fieldIds) {
      const value = formData[fieldId];
      const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      const regex = new RegExp(`\\{${fieldId}\\}`, 'g');
      parsedFormula = parsedFormula.replace(regex, String(numValue));
    }

    // Safe evaluation of math expression
    // Only allow numbers and math operators
    const sanitized = parsedFormula.replace(/[^0-9+\-*/().\s]/g, '');
    const result = Function(`"use strict"; return (${sanitized})`)();

    return typeof result === 'number' && !isNaN(result) ? result : 0;
  } catch (error) {
    console.error('Error evaluating custom formula:', error);
    return 0;
  }
}

// =====================================================
// Get All Calculated Fields
// =====================================================

export function getCalculatedValues(
  calculationRules: CalculationRule[],
  formData: Record<string, unknown>
): Record<string, number> {
  const calculated: Record<string, number> = {};

  for (const rule of calculationRules) {
    // Create a unique key for this calculation
    const key = `calc_${rule.type}_${rule.fieldIds.join('_')}`;

    if (rule.formula) {
      calculated[key] = evaluateCustomFormula(rule.formula, formData, rule.fieldIds);
    } else {
      calculated[key] = calculate(rule, formData);
    }
  }

  return calculated;
}

// =====================================================
// Update Form Data with Calculations
// =====================================================

export function applyCalculations(
  calculationRules: CalculationRule[],
  targetFieldId: string,
  formData: Record<string, unknown>
): Record<string, unknown> {
  const updatedData = { ...formData };

  for (const rule of calculationRules) {
    const result = rule.formula
      ? evaluateCustomFormula(rule.formula, formData, rule.fieldIds)
      : calculate(rule, formData);

    updatedData[targetFieldId] = result;
  }

  return updatedData;
}

// =====================================================
// Validate Calculation Rule
// =====================================================

export function validateCalculationRule(rule: CalculationRule): boolean {
  if (!rule.type) {
    console.warn('Calculation rule must have a type');
    return false;
  }

  if (!rule.fieldIds || rule.fieldIds.length === 0) {
    console.warn('Calculation rule must have at least one field ID');
    return false;
  }

  if (rule.type === 'custom' && !rule.formula) {
    console.warn('Custom calculation must have a formula');
    return false;
  }

  return true;
}

// =====================================================
// Get Calculation Type Label
// =====================================================

export function getCalculationTypeLabel(type: CalculationType): string {
  const labels: Record<CalculationType, string> = {
    sum: 'Sum',
    difference: 'Difference',
    product: 'Product',
    quotient: 'Quotient',
    count: 'Count',
    average: 'Average',
    min: 'Minimum',
    max: 'Maximum',
    custom: 'Custom Formula',
  };

  return labels[type] || type;
}

// =====================================================
// Get Supported Math Operations for Formula
// =====================================================

export const MATH_OPERATIONS = [
  { symbol: '+', label: 'Addition', description: 'Add two values' },
  { symbol: '-', label: 'Subtraction', description: 'Subtract second value from first' },
  { symbol: '*', label: 'Multiplication', description: 'Multiply values' },
  { symbol: '/', label: 'Division', description: 'Divide first value by second' },
  { symbol: '()', label: 'Parentheses', description: 'Group operations' },
  { symbol: 'Math.pow(x, y)', label: 'Power', description: 'x to the power of y' },
  { symbol: 'Math.sqrt(x)', label: 'Square Root', description: 'Square root of x' },
  { symbol: 'Math.abs(x)', label: 'Absolute', description: 'Absolute value of x' },
  { symbol: 'Math.round(x)', label: 'Round', description: 'Round to nearest integer' },
  { symbol: 'Math.ceil(x)', label: 'Ceiling', description: 'Round up to nearest integer' },
  { symbol: 'Math.floor(x)', label: 'Floor', description: 'Round down to nearest integer' },
];

// =====================================================
// Formula Builder Helper
// =====================================================

export function buildFormula(
  operation: string,
  fieldIds: string[]
): string {
  if (fieldIds.length === 0) return '';

  const placeholders = fieldIds.map((id) => `{${id}}`);

  switch (operation) {
    case 'sum':
      return placeholders.join(' + ');
    case 'difference':
      return placeholders.join(' - ');
    case 'product':
      return placeholders.join(' * ');
    case 'quotient':
      return placeholders.join(' / ');
    case 'average':
      return `(${placeholders.join(' + ')}) / ${fieldIds.length}`;
    case 'min':
      return `Math.min(${placeholders.join(', ')})`;
    case 'max':
      return `Math.max(${placeholders.join(', ')})`;
    default:
      return placeholders.join(' + ');
  }
}

// =====================================================
// Check if Calculation Depends on Field
// =====================================================

export function calculationDependsOn(
  rule: CalculationRule,
  fieldId: string
): boolean {
  return rule.fieldIds.includes(fieldId);
}

// =====================================================
// Get Calculation Dependencies
// =====================================================

export function getCalculationDependencies(
  rules: CalculationRule[],
  fieldId: string
): CalculationRule[] {
  return rules.filter((rule) => calculationDependsOn(rule, fieldId));
}
