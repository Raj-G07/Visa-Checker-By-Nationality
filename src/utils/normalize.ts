export const normalizeForCompare = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z]/g, '');

export const normalizeForDisplay = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
