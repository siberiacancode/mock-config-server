import type { Request } from 'express';

import { describe, expect, it } from 'vitest';

import { equals, regExp } from '../../../../entities';
import { isRestRequestMatchedByEntities } from './isRestRequestMatchedByEntities';

const createRequest = (value: object = {}) =>
  ({
    body: {},
    cookies: {},
    headers: {},
    params: {},
    queries: {},
    ...value
  }) as unknown as Request;

describe('isRestRequestMatchedByEntities', () => {
  it('Should match route configuration without entities', () => {
    expect(isRestRequestMatchedByEntities(createRequest(), undefined)).toBe(true);
  });

  it('Should match route configuration with empty entities', () => {
    expect(isRestRequestMatchedByEntities(createRequest(), {})).toBe(true);
  });

  it('Should match body by strict equality', () => {
    const request = createRequest({ body: { key: 'value' } });

    expect(isRestRequestMatchedByEntities(request, { body: { key: 'value' } })).toBe(true);
    expect(isRestRequestMatchedByEntities(request, { body: { key: 'other' } })).toBe(false);
  });

  it('Should match flat body key against a nested actual body', () => {
    const request = createRequest({
      body: { key1: { nestedKey1: 'nestedValue1' }, key2: { nestedKey2: 'nestedValue2' } }
    });

    expect(
      isRestRequestMatchedByEntities(request, {
        body: { 'key1.nestedKey1': 'nestedValue1', 'key2.nestedKey2': 'nestedValue2' }
      })
    ).toBe(true);
    expect(isRestRequestMatchedByEntities(request, { body: { 'key1.nestedKey1': 'other' } })).toBe(
      false
    );
  });

  it('Should match empty body against an empty body entity', () => {
    expect(isRestRequestMatchedByEntities(createRequest({ body: {} }), { body: {} })).toBe(true);
    expect(
      isRestRequestMatchedByEntities(createRequest({ body: { key: 'value' } }), { body: {} })
    ).toBe(false);
  });

  it('Should match mapped entity by property', () => {
    const request = createRequest({ queries: { key: 'value', extra: 'ignored' } });

    expect(isRestRequestMatchedByEntities(request, { queries: { key: 'value' } })).toBe(true);
    expect(isRestRequestMatchedByEntities(request, { queries: { key: 'other' } })).toBe(false);
  });

  it('Should match header property regardless of key casing', () => {
    const request = createRequest({ headers: { lowercase: 'value' } });

    expect(isRestRequestMatchedByEntities(request, { headers: { LOWERCASE: 'value' } })).toBe(true);
  });

  it('Should match by top level comparator', () => {
    const request = createRequest({ queries: { key: 'value' } });

    expect(isRestRequestMatchedByEntities(request, { queries: equals({ key: 'value' }) })).toBe(
      true
    );
    expect(isRestRequestMatchedByEntities(request, { queries: equals({ key: 'other' }) })).toBe(
      false
    );
  });

  it('Should match by property comparator', () => {
    const request = createRequest({ queries: { key: 'value' } });

    expect(isRestRequestMatchedByEntities(request, { queries: { key: regExp(/^val/) } })).toBe(
      true
    );
    expect(isRestRequestMatchedByEntities(request, { queries: { key: regExp(/^other/) } })).toBe(
      false
    );
  });

  it('Should match only when every entity is matched', () => {
    const request = createRequest({ queries: { key: 'value' }, body: { id: 1 } });

    expect(
      isRestRequestMatchedByEntities(request, { queries: { key: 'value' }, body: { id: 1 } })
    ).toBe(true);
    expect(
      isRestRequestMatchedByEntities(request, { queries: { key: 'value' }, body: { id: 2 } })
    ).toBe(false);
  });
});
