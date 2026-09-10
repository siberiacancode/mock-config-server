import { describe, expect, it } from 'vitest';

import { equals } from '../../../../core/entities';
import { connectionRouteConfigSchema } from './connectionRouteConfigSchema';

const data = () => ({ ok: true });

describe('connectionRouteConfigSchema: entities', () => {
  it('Should pass route config without entities', () => {
    expect(connectionRouteConfigSchema.safeParse({ data }).success).toBe(true);
  });

  it('Should pass supported entities', () => {
    const parseResult = connectionRouteConfigSchema.safeParse({
      data,
      entities: {
        headers: { key: 'value' },
        cookies: { token: 'abc' },
        queries: { room: 'public' }
      }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should pass comparator entities', () => {
    const parseResult = connectionRouteConfigSchema.safeParse({
      data,
      entities: { queries: equals({ room: 'public' }) }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should return error on invalid headers entity', () => {
    const parseResult = connectionRouteConfigSchema.safeParse({
      data,
      entities: { headers: 'value' }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should return error on unsupported entity name', () => {
    const parseResult = connectionRouteConfigSchema.safeParse({
      data,
      entities: { params: { key: 'value' } }
    });
    expect(parseResult.success).toBe(false);
  });
});
