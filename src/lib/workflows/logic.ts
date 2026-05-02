/**
 * Logic and Condition Evaluation for Workflows
 * Handles condition evaluation, data transformation, and flow control
 */

import type { ConditionGroup, Condition } from './types';

/**
 * Evaluate a condition group against context data
 */
export function evaluateCondition(
  conditionGroup: ConditionGroup,
  context: Record<string, any>
): boolean {
  const results = conditionGroup.conditions.map(condition =>
    evaluateSingleCondition(condition, context)
  );

  if (conditionGroup.operator === 'and') {
    return results.every(result => result === true);
  } else {
    return results.some(result => result === true);
  }
}

/**
 * Evaluate a single condition
 */
function evaluateSingleCondition(
  condition: Condition,
  context: Record<string, any>
): boolean {
  const actualValue = getValueAtPath(context, condition.field);

  switch (condition.operator) {
    case 'eq':
      return actualValue === condition.value;
    case 'ne':
      return actualValue !== condition.value;
    case 'gt':
      return actualValue > condition.value;
    case 'lt':
      return actualValue < condition.value;
    case 'gte':
      return actualValue >= condition.value;
    case 'lte':
      return actualValue <= condition.value;
    case 'contains':
      if (typeof actualValue === 'string') {
        return actualValue.includes(condition.value);
      }
      if (Array.isArray(actualValue)) {
        return actualValue.includes(condition.value);
      }
      return false;
    case 'starts_with':
      if (typeof actualValue === 'string') {
        return actualValue.startsWith(condition.value);
      }
      return false;
    case 'ends_with':
      if (typeof actualValue === 'string') {
        return actualValue.endsWith(condition.value);
      }
      return false;
    case 'is_empty':
      return actualValue === null || actualValue === undefined || actualValue === '';
    case 'is_not_empty':
      return actualValue !== null && actualValue !== undefined && actualValue !== '';
    default:
      return false;
  }
}

/**
 * Get value from object using dot-notation path
 */
export function getValueAtPath(obj: Record<string, any>, path: string): any {
  const parts = path.split('.');
  let value = obj;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Set value at path in object
 */
export function setValueAtPath(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  const lastPart = parts.pop()!;
  let current = obj;

  for (const part of parts) {
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[lastPart] = value;
}

/**
 * Transform data using a transformation map
 */
export function transformData(
  data: Record<string, any>,
  transformation: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [targetPath, sourcePath] of Object.entries(transformation)) {
    const value = getValueAtPath(data, sourcePath);
    setValueAtPath(result, targetPath, value);
  }

  return result;
}

/**
 * Filter array of objects based on conditions
 */
export function filterArray(
  items: Record<string, any>[],
  conditionGroup: ConditionGroup
): Record<string, any>[] {
  return items.filter(item => evaluateCondition(conditionGroup, item));
}

/**
 * Map array of objects
 */
export function mapArray(
  items: Record<string, any>[],
  transformation: Record<string, string>
): Record<string, any>[] {
  return items.map(item => transformData(item, transformation));
}

/**
 * Aggregate array data
 */
export function aggregateArray(
  items: Record<string, any>[],
  operation: 'sum' | 'avg' | 'min' | 'max' | 'count',
  field?: string
): number {
  if (operation === 'count') {
    return items.length;
  }

  if (!field) {
    throw new Error(`Field is required for ${operation} operation`);
  }

  const values = items
    .map(item => getValueAtPath(item, field))
    .filter(value => typeof value === 'number') as number[];

  if (values.length === 0) {
    return 0;
  }

  switch (operation) {
    case 'sum':
      return values.reduce((sum, value) => sum + value, 0);
    case 'avg':
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return 0;
  }
}

/**
 * Deep merge two objects
 */
export function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Create template string from context
 */
export function interpolateTemplate(
  template: string,
  context: Record<string, any>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getValueAtPath(context, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Validate data against schema
 */
export function validateData(
  data: Record<string, any>,
  schema: Record<string, { type: string; required?: boolean }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = getValueAtPath(data, field);

    if (rules.required && (value === undefined || value === null)) {
      errors.push(`Field '${field}' is required`);
      continue;
    }

    if (value !== undefined && rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push(`Field '${field}' must be of type '${rules.type}'`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
