export const PRESETS = {
  destinations: ['Manali', 'Coorg', 'Shillong', 'Gokarna', 'Hampi', 'Ladakh'],
  months: ['October', 'December', 'February', 'June'],
  vibes: ['Quiet Trekking', 'Culinary Journey', 'Heritage & Art', 'Off the Beaten Path', 'Budget Friendly']
};

/**
 * Returns the formatted tag prefix string based on the preset categories.
 */
export function getPrefixedChip(chip: string): string {
  if (PRESETS.destinations.includes(chip)) {
    return `destination: ${chip}`;
  }
  if (PRESETS.months.includes(chip)) {
    return `month: ${chip}`;
  }
  if (PRESETS.vibes.includes(chip)) {
    return `vibe: ${chip}`;
  }
  return chip;
}
