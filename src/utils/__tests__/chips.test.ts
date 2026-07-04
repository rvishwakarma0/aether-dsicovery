import { describe, it, expect } from 'vitest';
import { PRESETS, getPrefixedChip } from '../chips';

describe('chips utility', () => {
  it('should have predefined categories in PRESETS', () => {
    expect(PRESETS).toBeDefined();
    expect(PRESETS.destinations).toContain('Manali');
    expect(PRESETS.months).toContain('October');
    expect(PRESETS.vibes).toContain('Quiet Trekking');
  });

  it('should correctly format a destination preset with destination: prefix', () => {
    expect(getPrefixedChip('Manali')).toBe('destination: Manali');
    expect(getPrefixedChip('Ladakh')).toBe('destination: Ladakh');
  });

  it('should correctly format a month preset with month: prefix', () => {
    expect(getPrefixedChip('October')).toBe('month: October');
    expect(getPrefixedChip('December')).toBe('month: December');
  });

  it('should correctly format a vibe preset with vibe: prefix', () => {
    expect(getPrefixedChip('Quiet Trekking')).toBe('vibe: Quiet Trekking');
    expect(getPrefixedChip('Budget Friendly')).toBe('vibe: Budget Friendly');
  });

  it('should return the original input if the chip is not a recognized preset', () => {
    expect(getPrefixedChip('Unknown Location')).toBe('Unknown Location');
    expect(getPrefixedChip('July')).toBe('July');
    expect(getPrefixedChip('Adventurous')).toBe('Adventurous');
  });
});
