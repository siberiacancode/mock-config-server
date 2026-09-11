import { describe, expect, it } from 'vitest';

import { equals } from '../../../../core/entities';
import { closeRouteConfigSchema } from './closeRouteConfigSchema';

const data = () => ({ ok: true });

describe('closeRouteConfigSchema: entities', () => {
  it('Should pass route config without entities', () => {
    expect(closeRouteConfigSchema.safeParse({ data }).success).toBe(true);
  });

  it('Should pass supported entities', () => {
    const parseResult = closeRouteConfigSchema.safeParse({
      data,
      entities: { code: 1000, reason: 'normal closure' }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should pass comparator entities', () => {
    const parseResult = closeRouteConfigSchema.safeParse({
      data,
      entities: { code: equals(1000) }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should return error on invalid code entity', () => {
    const parseResult = closeRouteConfigSchema.safeParse({
      data,
      entities: { code: '1000' }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should return error on unsupported entity name', () => {
    const parseResult = closeRouteConfigSchema.safeParse({
      data,
      entities: { message: 'normal closure' }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should pass settings with delay', () => {
    const parseResult = closeRouteConfigSchema.safeParse({ data, settings: { delay: 100 } });
    expect(parseResult.success).toBe(true);
  });

  it('Should return error on status in settings', () => {
    const parseResult = closeRouteConfigSchema.safeParse({ data, settings: { status: 200 } });
    expect(parseResult.success).toBe(false);
  });
});
