import { describe, expect, it } from 'vitest';

import { equals, haveEntries, regExp } from '../../../../entities';
import { isGraphqlTransportWsRequestMatchedByEntities } from './isGraphqlTransportWsRequestMatchedByEntities';

describe('isGraphqlTransportWsRequestMatchedByEntities', () => {
  it('Should match route configuration without entities', () => {
    expect(isGraphqlTransportWsRequestMatchedByEntities({ roomId: '1' }, undefined)).toBe(true);
  });

  it('Should match route configuration with empty entities', () => {
    expect(isGraphqlTransportWsRequestMatchedByEntities({ roomId: '1' }, {})).toBe(true);
  });

  it('Should match variables by strict equality', () => {
    const variables = { roomId: '1', limit: 10 };

    expect(
      isGraphqlTransportWsRequestMatchedByEntities(variables, {
        variables: { roomId: '1', limit: 10 }
      })
    ).toBe(true);
    expect(
      isGraphqlTransportWsRequestMatchedByEntities(variables, {
        variables: { roomId: '2', limit: 10 }
      })
    ).toBe(false);
  });

  it('Should not match when variables have extra keys', () => {
    expect(
      isGraphqlTransportWsRequestMatchedByEntities(
        { roomId: '1', limit: 10 },
        { variables: { roomId: '1' } }
      )
    ).toBe(false);
  });

  it('Should match by comparator', () => {
    const variables = { roomId: '1', limit: 10 };

    expect(
      isGraphqlTransportWsRequestMatchedByEntities(variables, {
        variables: haveEntries({ roomId: '1' })
      })
    ).toBe(true);
    expect(
      isGraphqlTransportWsRequestMatchedByEntities(variables, {
        variables: haveEntries({ roomId: '2' })
      })
    ).toBe(false);
    expect(
      isGraphqlTransportWsRequestMatchedByEntities(variables, {
        variables: haveEntries({ roomId: regExp(/^\d$/) })
      })
    ).toBe(true);
    expect(
      isGraphqlTransportWsRequestMatchedByEntities(variables, {
        variables: equals({ roomId: '1', limit: 10 })
      })
    ).toBe(true);
  });

  it('Should not match entities when variables are missing', () => {
    expect(
      isGraphqlTransportWsRequestMatchedByEntities(undefined, { variables: { roomId: '1' } })
    ).toBe(false);
    expect(isGraphqlTransportWsRequestMatchedByEntities(null, { variables: { roomId: '1' } })).toBe(
      false
    );
  });

  it('Should match route configuration without entities when variables are missing', () => {
    expect(isGraphqlTransportWsRequestMatchedByEntities(undefined, undefined)).toBe(true);
  });
});
