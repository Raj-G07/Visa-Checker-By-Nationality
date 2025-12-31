import { StayPolicy } from '../types/visa';
import { cleanWikipediaText } from '../utils/text';

export const parseAllowedStay = (
  text: string | null
): {
  maxStayDays: number | null;
  allowedStayText: string | null;
  stayPolicy: StayPolicy;
} => {
  if (!text)
    return { maxStayDays: null, allowedStayText: null, stayPolicy: null };

  const raw = cleanWikipediaText(text);
  const t = raw.toLowerCase();

  if (t.includes('unlimited'))
    return {
      maxStayDays: null,
      allowedStayText: raw,
      stayPolicy: t.includes('only') ? 'conditional' : 'unlimited',
    };

  const match =
    t.match(/(\d+)\s*day/) ||
    t.match(/(\d+)\s*week/) ||
    t.match(/(\d+)\s*month/) ||
    t.match(/(\d+)\s*year/);

  if (match) {
    const value = Number(match[1]);
    const days =
      t.includes('year') ? value * 365 :
      t.includes('month') ? value * 30 :
      t.includes('week') ? value * 7 :
      value;

    return {
      maxStayDays: days,
      allowedStayText: raw,
      stayPolicy: 'fixed',
    };
  }

  if (t.includes('within') || t.includes('per'))
    return { maxStayDays: null, allowedStayText: raw, stayPolicy: 'range' };

  return { maxStayDays: null, allowedStayText: raw, stayPolicy: 'unknown' };
};
