/**
 * Unit Tests for Workflow Logic and Condition Evaluation
 */

// @ts-nocheck - vitest types not installed for build
import { describe, it, expect } from 'vitest';
import {
  evaluateCondition,
  getValueAtPath,
  setValueAtPath,
  transformData,
  filterArray,
  mapArray,
  aggregateArray,
  deepMerge,
  interpolateTemplate,
  validateData,
} from '../logic';
import type { ConditionGroup } from '../types';

describe('Condition Evaluation', () => {
  describe('evaluateCondition', () => {
    const context = {
      contact: {
        email: 'test@example.com',
        age: 25,
        status: 'active',
      },
      tags: ['vip', 'premium'],
    };

    it('should evaluate AND conditions correctly', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.age', operator: 'gte', value: 18 },
          { field: 'contact.status', operator: 'eq', value: 'active' },
        ],
      };

      const result = evaluateCondition(conditionGroup, context);
      expect(result).toBe(true);
    });

    it('should evaluate OR conditions correctly', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'or',
        conditions: [
          { field: 'contact.age', operator: 'lt', value: 18 },
          { field: 'contact.status', operator: 'eq', value: 'active' },
        ],
      };

      const result = evaluateCondition(conditionGroup, context);
      expect(result).toBe(true);
    });

    it('should handle equals operator', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.status', operator: 'eq', value: 'active' },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);

      conditionGroup.conditions[0].value = 'inactive';
      expect(evaluateCondition(conditionGroup, context)).toBe(false);
    });

    it('should handle not equals operator', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.status', operator: 'ne', value: 'inactive' },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);
    });

    it('should handle greater than/less than operators', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.age', operator: 'gt', value: 20 },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);

      conditionGroup.conditions[0].value = 30;
      expect(evaluateCondition(conditionGroup, context)).toBe(false);
    });

    it('should handle contains operator for strings', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.email', operator: 'contains', value: 'example' },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);
    });

    it('should handle contains operator for arrays', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'tags', operator: 'contains', value: 'vip' },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);
    });

    it('should handle starts_with operator', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.email', operator: 'starts_with', value: 'test' },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);
    });

    it('should handle ends_with operator', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.email', operator: 'ends_with', value: '.com' },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);
    });

    it('should handle is_empty operator', () => {
      const testContext = { name: '', age: 25 };

      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'name', operator: 'is_empty', value: null },
        ],
      };

      expect(evaluateCondition(conditionGroup, testContext)).toBe(true);
    });

    it('should handle is_not_empty operator', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'contact.email', operator: 'is_not_empty', value: null },
        ],
      };

      expect(evaluateCondition(conditionGroup, context)).toBe(true);
    });
  });
});

describe('Path Operations', () => {
  describe('getValueAtPath', () => {
    const obj = {
      user: {
        name: 'John',
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
      tags: ['vip', 'premium'],
    };

    it('should get value at simple path', () => {
      expect(getValueAtPath(obj, 'user.name')).toBe('John');
    });

    it('should get value at nested path', () => {
      expect(getValueAtPath(obj, 'user.address.city')).toBe('NYC');
    });

    it('should return undefined for missing path', () => {
      expect(getValueAtPath(obj, 'user.missing')).toBeUndefined();
      expect(getValueAtPath(obj, 'missing.path')).toBeUndefined();
    });

    it('should handle array access', () => {
      expect(getValueAtPath(obj, 'tags.0')).toBe('vip');
    });
  });

  describe('setValueAtPath', () => {
    it('should set value at simple path', () => {
      const obj: any = {};
      setValueAtPath(obj, 'name', 'John');
      expect(obj.name).toBe('John');
    });

    it('should set value at nested path', () => {
      const obj: any = {};
      setValueAtPath(obj, 'user.address.city', 'NYC');
      expect(obj.user.address.city).toBe('NYC');
    });

    it('should overwrite existing value', () => {
      const obj: any = { name: 'Jane' };
      setValueAtPath(obj, 'name', 'John');
      expect(obj.name).toBe('John');
    });
  });
});

describe('Data Transformation', () => {
  describe('transformData', () => {
    it('should transform data according to mapping', () => {
      const source = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      };

      const transformation = {
        'contact.firstName': 'first_name',
        'contact.lastName': 'last_name',
        'contact.email': 'email_address',
      };

      const result = transformData(source, transformation);

      expect(result).toEqual({
        contact: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      });
    });

    it('should handle missing paths gracefully', () => {
      const source = { name: 'John' };
      const transformation = {
        'user.name': 'name',
        'user.age': 'age',
      };

      const result = transformData(source, transformation);

      expect(result.user.name).toBe('John');
      expect(result.user.age).toBeUndefined();
    });
  });
});

describe('Array Operations', () => {
  const items = [
    { name: 'John', age: 25, status: 'active' },
    { name: 'Jane', age: 30, status: 'inactive' },
    { name: 'Bob', age: 35, status: 'active' },
  ];

  describe('filterArray', () => {
    it('should filter array based on conditions', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'and',
        conditions: [
          { field: 'age', operator: 'gte', value: 30 },
        ],
      };

      const result = filterArray(items, conditionGroup);

      expect(result).toHaveLength(2);
      expect(result.every(item => item.age >= 30)).toBe(true);
    });

    it('should handle OR conditions in filtering', () => {
      const conditionGroup: ConditionGroup = {
        operator: 'or',
        conditions: [
          { field: 'age', operator: 'lt', value: 30 },
          { field: 'status', operator: 'eq', value: 'active' },
        ],
      };

      const result = filterArray(items, conditionGroup);

      expect(result).toHaveLength(3); // All items match
    });
  });

  describe('mapArray', () => {
    it('should transform array items', () => {
      const transformation = {
        'fullName': 'name',
        'userAge': 'age',
      };

      const result = mapArray(items, transformation);

      expect(result).toEqual([
        { fullName: 'John', userAge: 25 },
        { fullName: 'Jane', userAge: 30 },
        { fullName: 'Bob', userAge: 35 },
      ]);
    });
  });

  describe('aggregateArray', () => {
    it('should sum numeric field', () => {
      const result = aggregateArray(items, 'sum', 'age');
      expect(result).toBe(90);
    });

    it('should average numeric field', () => {
      const result = aggregateArray(items, 'avg', 'age');
      expect(result).toBe(30);
    });

    it('should find minimum', () => {
      const result = aggregateArray(items, 'min', 'age');
      expect(result).toBe(25);
    });

    it('should find maximum', () => {
      const result = aggregateArray(items, 'max', 'age');
      expect(result).toBe(35);
    });

    it('should count items', () => {
      const result = aggregateArray(items, 'count');
      expect(result).toBe(3);
    });

    it('should return 0 for empty array', () => {
      const result = aggregateArray([], 'sum', 'age');
      expect(result).toBe(0);
    });
  });
});

describe('Object Operations', () => {
  describe('deepMerge', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge nested objects', () => {
      const target = { user: { name: 'John', age: 25 } };
      const source = { user: { age: 26, city: 'NYC' } };

      const result = deepMerge(target, source);

      expect(result).toEqual({
        user: { name: 'John', age: 26, city: 'NYC' },
      });
    });

    it('should not modify target object', () => {
      const target = { a: 1 };
      const source = { b: 2 };

      deepMerge(target, source);

      expect(target).toEqual({ a: 1 });
    });
  });
});

describe('Template Interpolation', () => {
  describe('interpolateTemplate', () => {
    const context = {
      user: { name: 'John' },
      email: 'john@example.com',
    };

    it('should replace single variable', () => {
      const template = 'Hello, {{user.name}}!';
      const result = interpolateTemplate(template, context);

      expect(result).toBe('Hello, John!');
    });

    it('should replace multiple variables', () => {
      const template = 'Email: {{email}}, Name: {{user.name}}';
      const result = interpolateTemplate(template, context);

      expect(result).toBe('Email: john@example.com, Name: John');
    });

    it('should handle missing variables', () => {
      const template = 'Hello, {{missing.name}}!';
      const result = interpolateTemplate(template, context);

      expect(result).toBe('Hello, {{missing.name}}!');
    });

    it('should handle whitespace in templates', () => {
      const template = 'Value: {{ user.name }}';
      const result = interpolateTemplate(template, context);

      expect(result).toBe('Value: John');
    });
  });
});

describe('Data Validation', () => {
  describe('validateData', () => {
    const schema = {
      name: { type: 'string', required: true },
      age: { type: 'number', required: true },
      email: { type: 'string', required: false },
    };

    it('should validate valid data', () => {
      const data = { name: 'John', age: 25 };
      const result = validateData(data, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const data = { name: 'John' };
      const result = validateData(data, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'age' is required");
    });

    it('should detect type mismatches', () => {
      const data = { name: 'John', age: '25' };
      const result = validateData(data, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("'age'"))).toBe(true);
    });

    it('should allow optional fields to be missing', () => {
      const data = { name: 'John', age: 25 };
      const result = validateData(data, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate array types', () => {
      const arraySchema = {
        tags: { type: 'array', required: true },
      };

      const data = { tags: ['vip', 'premium'] };
      const result = validateData(data, arraySchema);

      expect(result.valid).toBe(true);
    });
  });
});
