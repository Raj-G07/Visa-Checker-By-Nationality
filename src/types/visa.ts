export type VisaType =
  | 'Visa-free'
  | 'Visa on arrival'
  | 'eVisa'
  | 'Visa required'
  | 'Freedom of movement'
  | 'Other';

export type StayPolicy =
  | 'fixed'
  | 'range'
  | 'conditional'
  | 'unlimited'
  | 'unknown'
  | null;

export type VisaResult = {
  nationality: string;
  destination: string;
  visaType: VisaType;
  visaTypeRaw: string;
  visaType_localized?: string;
  maxStayDays: number | null;
  allowedStayText: string | null;
  allowedStayText_localized?: string | null;
  stayPolicy: StayPolicy;
  notes: string | null;
  notes_localized?: string | null;
  additionalInfoUrls: {
    key: string;
    title: string;
    title_localized?: string;
    url: string;
  }[];
  language: string;
  scrapedAt: string;
  found: boolean;
};
