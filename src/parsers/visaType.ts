import { VisaType } from '../types/visa';
import { cleanWikipediaText } from '../utils/text';

export const parseVisaType = (text: string): {
  visaType: VisaType;
  visaTypeRaw: string;
} => {
  const raw = cleanWikipediaText(text);
  const t = raw.toLowerCase();

  if (t.includes('freedom of movement'))
    return { visaType: 'Freedom of movement', visaTypeRaw: raw };

  if (t.includes('visa not required') || t.includes('visa-free'))
    return { visaType: 'Visa-free', visaTypeRaw: raw };

  if (t.includes('online visa') && t.includes('visa on arrival'))
    return { visaType: 'Visa on arrival', visaTypeRaw: raw };

  if (t.includes('online visa') || t.includes('e-visa'))
    return { visaType: 'eVisa', visaTypeRaw: raw };

  if (t.includes('visa on arrival'))
    return { visaType: 'Visa on arrival', visaTypeRaw: raw };

  if (t.includes('visa required'))
    return { visaType: 'Visa required', visaTypeRaw: raw };

  return { visaType: 'Other', visaTypeRaw: raw };
};
