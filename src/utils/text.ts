export const cleanWikipediaText = (text: string): string =>
  text
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
