import { describe, expect, it } from 'vitest';

import { equals } from '../../../../core/entities';
import { rawRouteConfigSchema } from './rawRouteConfigSchema';

const data = () => ({ ok: true });

describe('rawRouteConfigSchema: entities', () => {
  it('Should pass route config without entities', () => {
    expect(rawRouteConfigSchema.safeParse({ data }).success).toBe(true);
  });

  it('Should pass supported entities', () => {
    const parseResult = rawRouteConfigSchema.safeParse({
      data,
      entities: { isBinary: false, raw: () => true }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should pass comparator entities', () => {
    const parseResult = rawRouteConfigSchema.safeParse({
      data,
      entities: { isBinary: equals(true) }
    });
    expect(parseResult.success).toBe(true);
  });

  it('Should return error on invalid isBinary entity', () => {
    const parseResult = rawRouteConfigSchema.safeParse({
      data,
      entities: { isBinary: 'true' }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should return error on invalid raw entity', () => {
    const parseResult = rawRouteConfigSchema.safeParse({
      data,
      entities: { raw: 'ping' }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should return error on unsupported entity name', () => {
    const parseResult = rawRouteConfigSchema.safeParse({
      data,
      entities: { headers: { key: 'value' } }
    });
    expect(parseResult.success).toBe(false);
  });

  it('Should pass settings with delay', () => {
    const parseResult = rawRouteConfigSchema.safeParse({ data, settings: { delay: 100 } });
    expect(parseResult.success).toBe(true);
  });

  it('Should return error on status in settings', () => {
    const parseResult = rawRouteConfigSchema.safeParse({ data, settings: { status: 200 } });
    expect(parseResult.success).toBe(false);
  });
});
