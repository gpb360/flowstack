/**
 * Conditional Logic System
 * Handles show/hide, require/optional, enable/disable, and set_value actions
 */

import type {
  ConditionalRule,
  ConditionalAction,
  ConditionalLogic,
  ConditionalOperator,
  FormState,
} from './schema';

// =====================================================
// Evaluate a Single Condition
// =====================================================

export function evaluateCondition(
  rule: ConditionalRule,
  formData: Record<string, unknown>
): boolean {
  const fieldValue = formData[rule.fieldId];

  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;

    case 'not_equals':
      return fieldValue !== rule.value;

    case 'contains':
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue.toLowerCase().includes(rule.value.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(rule.value);
      }
      return false;

    case 'not_contains':
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return !fieldValue.toLowerCase().includes(rule.value.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(rule.value);
      }
      return true;

    case 'gt':
      if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
        return fieldValue > rule.value;
      }
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue > rule.value;
      }
      return false;

    case 'lt':
      if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
        return fieldValue < rule.value;
      }
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue < rule.value;
      }
      return false;

    case 'gte':
      if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
        return fieldValue >= rule.value;
      }
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue >= rule.value;
      }
      return false;

    case 'lte':
      if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
        return fieldValue <= rule.value;
      }
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue <= rule.value;
      }
      return false;

    case 'empty':
      return (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case 'not_empty':
      return (
        fieldValue !== null &&
        fieldValue !== undefined &&
        fieldValue !== '' &&
        (!Array.isArray(fieldValue) || fieldValue.length > 0)
      );

    case 'starts_with':
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue.toLowerCase().startsWith(rule.value.toLowerCase());
      }
      return false;

    case 'ends_with':
      if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
        return fieldValue.toLowerCase().endsWith(rule.value.toLowerCase());
      }
      return false;

    default:
      console.warn(`Unknown conditional operator: ${rule.operator}`);
      return false;
  }
}

// =====================================================
// Evaluate Multiple Conditions with AND/OR
// =====================================================

export function evaluateConditions(
  rules: ConditionalRule[],
  formData: Record<string, unknown>
): boolean {
  if (rules.length === 0) return true;

  // Group rules by logic (and/or)
  const andGroups: ConditionalRule[][] = [];
  let currentGroup: ConditionalRule[] = [];

  for (const rule of rules) {
    if (rule.logic === 'or' && currentGroup.length > 0) {
      andGroups.push(currentGroup);
      currentGroup = [rule];
    } else {
      currentGroup.push(rule);
    }
  }

  if (currentGroup.length > 0) {
    andGroups.push(currentGroup);
  }

  // Evaluate each AND group, then OR them together
  return andGroups.some((group) =>
    group.every((rule) => evaluateCondition(rule, formData))
  );
}

// =====================================================
// Apply Conditional Actions
// =====================================================

export function applyConditionalAction(
  action: ConditionalAction,
  currentState: FormState
): FormState {
  const newState = { ...currentState };

  switch (action.type) {
    case 'show':
      newState.visibleFields[action.targetFieldId] = true;
      break;

    case 'hide':
      newState.visibleFields[action.targetFieldId] = false;
      // Clear value and errors when hiding
      newState.values[action.targetFieldId] = undefined;
      delete newState.errors[action.targetFieldId];
      break;

    case 'require':
      newState.requiredFields[action.targetFieldId] = true;
      break;

    case 'optional':
      newState.requiredFields[action.targetFieldId] = false;
      break;

    case 'set_value':
      if (action.value !== undefined) {
        newState.values[action.targetFieldId] = action.value;
      }
      break;

    case 'enable':
      newState.disabledFields[action.targetFieldId] = false;
      break;

    case 'disable':
      newState.disabledFields[action.targetFieldId] = true;
      break;
  }

  return newState;
}

// =====================================================
// Apply All Conditional Logic to Form State
// =====================================================

export function applyConditionalLogic(
  conditionalLogics: ConditionalLogic[],
  formData: Record<string, unknown>,
  fieldIds: string[]
): FormState {
  // Initialize form state
  const initialState: FormState = {
    values: { ...formData },
    errors: {},
    touched: {},
    visibleFields: Object.fromEntries(fieldIds.map((id) => [id, true])),
    requiredFields: {},
    disabledFields: {},
  };

  // Apply each conditional logic
  let currentState = initialState;

  for (const logic of conditionalLogics) {
    // Check if conditions are met
    const conditionsMet = evaluateConditions(logic.rules, currentState.values);

    if (conditionsMet) {
      // Apply actions
      for (const action of logic.actions) {
        currentState = applyConditionalAction(action, currentState);
      }
    }
  }

  return currentState;
}

// =====================================================
// Get Conditional Logic for a Field
// =====================================================

export function getFieldConditionalLogic(
  fieldId: string,
  allLogics: ConditionalLogic[]
): ConditionalLogic | undefined {
  return allLogics.find((logic) =>
    logic.actions.some((action) => action.targetFieldId === fieldId)
  );
}

// =====================================================
// Check if Field is Visible
// =====================================================

export function isFieldVisible(
  fieldId: string,
  conditionalLogics: ConditionalLogic[],
  formData: Record<string, unknown>
): boolean {
  const fieldLogic = getFieldConditionalLogic(fieldId, conditionalLogics);

  if (!fieldLogic) return true;

  // Check if any action sets this field to hidden
  const hideAction = fieldLogic.actions.find(
    (action) => action.targetFieldId === fieldId && action.type === 'hide'
  );

  if (!hideAction) return true;

  // Evaluate conditions
  return !evaluateConditions(fieldLogic.rules, formData);
}

// =====================================================
// Check if Field is Required
// =====================================================

export function isFieldRequired(
  fieldId: string,
  conditionalLogics: ConditionalLogic[],
  formData: Record<string, unknown>,
  baseRequired: boolean
): boolean {
  const fieldLogic = getFieldConditionalLogic(fieldId, conditionalLogics);

  if (!fieldLogic) return baseRequired;

  // Check if any action changes required state
  const requireAction = fieldLogic.actions.find(
    (action) => action.targetFieldId === fieldId && action.type === 'require'
  );

  const optionalAction = fieldLogic.actions.find(
    (action) => action.targetFieldId === fieldId && action.type === 'optional'
  );

  // Evaluate conditions
  if (requireAction && evaluateConditions(fieldLogic.rules, formData)) {
    return true;
  }

  if (optionalAction && evaluateConditions(fieldLogic.rules, formData)) {
    return false;
  }

  return baseRequired;
}

// =====================================================
// Get Auto-filled Value
// =====================================================

export function getAutoFilledValue(
  fieldId: string,
  conditionalLogics: ConditionalLogic[],
  formData: Record<string, unknown>
): unknown | undefined {
  const fieldLogic = getFieldConditionalLogic(fieldId, conditionalLogics);

  if (!fieldLogic) return undefined;

  // Find set_value action
  const setValueAction = fieldLogic.actions.find(
    (action) => action.targetFieldId === fieldId && action.type === 'set_value'
  );

  if (setValueAction && evaluateConditions(fieldLogic.rules, formData)) {
    return setValueAction.value;
  }

  return undefined;
}

// =====================================================
// Build Human-Readable Condition
// =====================================================

export function getConditionLabel(rule: ConditionalRule): string {
  const operatorLabels: Record<ConditionalOperator, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    gt: 'is greater than',
    lt: 'is less than',
    gte: 'is greater than or equal to',
    lte: 'is less than or equal to',
    empty: 'is empty',
    not_empty: 'is not empty',
    starts_with: 'starts with',
    ends_with: 'ends with',
  };

  const operatorLabel = operatorLabels[rule.operator];
  const valueLabel = rule.value === '' ? '(blank)' : String(rule.value);

  return `${operatorLabel} ${valueLabel}`;
}

// =====================================================
// Build Human-Readable Action
// =====================================================

export function getActionLabel(action: ConditionalAction): string {
  const actionLabels: Record<string, string> = {
    show: 'Show',
    hide: 'Hide',
    require: 'Require',
    optional: 'Make optional',
    set_value: `Set value to ${action.value ?? ''}`,
    enable: 'Enable',
    disable: 'Disable',
  };

  return actionLabels[action.type] || action.type;
}

// =====================================================
// Validate Conditional Logic
// =====================================================

export function validateConditionalLogic(logic: ConditionalLogic): boolean {
  if (!logic.rules || logic.rules.length === 0) {
    console.warn('Conditional logic must have at least one rule');
    return false;
  }

  if (!logic.actions || logic.actions.length === 0) {
    console.warn('Conditional logic must have at least one action');
    return false;
  }

  // Validate rules
  for (const rule of logic.rules) {
    if (!rule.fieldId || !rule.operator) {
      console.warn('Each rule must have fieldId and operator');
      return false;
    }
  }

  // Validate actions
  for (const action of logic.actions) {
    if (!action.targetFieldId) {
      console.warn('Each action must have targetFieldId');
      return false;
    }

    if (action.type === 'set_value' && action.value === undefined) {
      console.warn('set_value action must have a value');
      return false;
    }
  }

  return true;
}
