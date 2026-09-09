import type { Request } from 'express';

import { describe, expect, it } from 'vitest';

import { equals, regExp } from '../../../../entities';
import { isGraphQLRequestMatchedByEntities } from './isGraphQLRequestMatchedByEntities';

const createRequest = (value: object = {}) =>
  ({
    cookies: {},
    headers: {},
    queries: {},
    ...value
  }) as unknown as Request;

describe('isGraphQLRequestMatchedByEntities', () => {
  it('Should match route configuration without entities', () => {
    expect(isGraphQLRequestMatchedByEntities({ request: createRequest() }, undefined)).toBe(true);
  });

  it('Should match route configuration with empty entities', () => {
    expect(isGraphQLRequestMatchedByEntities({ request: createRequest() }, {})).toBe(true);
  });

  it('Should match variables by strict equality', () => {
    const params = { request: createRequest(), variables: { key: 'value' } };

    expect(isGraphQLRequestMatchedByEntities(params, { variables: { key: 'value' } })).toBe(true);
    expect(isGraphQLRequestMatchedByEntities(params, { variables: { key: 'other' } })).toBe(false);
  });

  it('Should match mapped entity by property', () => {
    const params = { request: createRequest({ queries: { key: 'value', extra: 'ignored' } }) };

    expect(isGraphQLRequestMatchedByEntities(params, { queries: { key: 'value' } })).toBe(true);
    expect(isGraphQLRequestMatchedByEntities(params, { queries: { key: 'other' } })).toBe(false);
  });

  it('Should match header property regardless of key casing', () => {
    const params = { request: createRequest({ headers: { lowercase: 'value' } }) };

    expect(isGraphQLRequestMatchedByEntities(params, { headers: { LOWERCASE: 'value' } })).toBe(
      true
    );
  });

  it('Should match by top level comparator', () => {
    const params = { request: createRequest(), variables: { key: 'value' } };

    expect(isGraphQLRequestMatchedByEntities(params, { variables: equals({ key: 'value' }) })).toBe(
      true
    );
    expect(isGraphQLRequestMatchedByEntities(params, { variables: equals({ key: 'other' }) })).toBe(
      false
    );
  });

  it('Should match by property comparator', () => {
    const params = { request: createRequest({ cookies: { token: 'abc' } }) };

    expect(isGraphQLRequestMatchedByEntities(params, { cookies: { token: regExp(/^ab/) } })).toBe(
      true
    );
    expect(isGraphQLRequestMatchedByEntities(params, { cookies: { token: regExp(/^zz/) } })).toBe(
      false
    );
  });

  it('Should match only when every entity is matched', () => {
    const params = {
      request: createRequest({ headers: { key: 'value' } }),
      variables: { id: 1 }
    };

    expect(
      isGraphQLRequestMatchedByEntities(params, { headers: { key: 'value' }, variables: { id: 1 } })
    ).toBe(true);
    expect(
      isGraphQLRequestMatchedByEntities(params, { headers: { key: 'value' }, variables: { id: 2 } })
    ).toBe(false);
  });
});
