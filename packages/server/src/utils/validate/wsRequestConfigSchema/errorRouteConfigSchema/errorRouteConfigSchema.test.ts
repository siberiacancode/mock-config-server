import { describe, expect, it } from 'vitest';

import { equals } from '../../../../core/entities';
import { errorRouteConfigSchema } from './errorRouteConfigSchema';

const data = () => ({ ok: true });

describe('errorRouteConfigSchema: entities', () => {
  it('Should pass route config without entities', () => {
    expect(errorRouteConfigSchema.safeParse({ data }).success).toBe(true);
  });

  it('Should pass supported entities', () => {
    const parseResult = errorRouteConfigSchema.safeParse({
      data,
      entities: { code: 'ECONNRESET', message: 'socket error' }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should pass comparator entities', () => {
    const parseResult = errorRouteConfigSchema.safeParse({
      data,
      entities: { code: equals('ECONNRESET') }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should return error on invalid message entity', () => {
    const parseResult = errorRouteConfigSchema.safeParse({
      data,
      entities: { message: 1 }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should return error on invalid code entity', () => {
    const parseResult = errorRouteConfigSchema.safeParse({
      data,
      entities: { code: 1000 }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should return error on unsupported entity name', () => {
    const parseResult = errorRouteConfigSchema.safeParse({
      data,
      entities: { reason: 'socket error' }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should pass settings with delay', () => {
    const parseResult = errorRouteConfigSchema.safeParse({ data, settings: { delay: 100 } });
    expect(parseResult.success).toBe(true);
  });

  it('Should return error on status in settings', () => {
    const parseResult = errorRouteConfigSchema.safeParse({ data, settings: { status: 200 } });
    expect(parseResult.success).toBe(false);
  });
});
