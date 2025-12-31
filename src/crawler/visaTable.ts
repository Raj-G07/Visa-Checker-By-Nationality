import { CheerioCrawler } from '@crawlee/cheerio';
import { Actor } from 'apify';

import { wikipediaVisaUrl } from '../constants/wikipedia';
import { ADDITIONAL_INFO_SECTIONS } from '../constants/additionalInfo';
import { normalizeForCompare, normalizeForDisplay } from '../utils/normalize';
import { cleanWikipediaText } from '../utils/text';
import { parseVisaType } from '../parsers/visaType';
import { parseAllowedStay } from '../parsers/allowedStay';
import { VisaResult } from '../types/visa';

interface VisaCrawlerInput {
  nationality: string;
  destination: string;
  language?: string;
  maxRequestsPerCrawl?: number;
}

export const runVisaCrawler = async (
  input: VisaCrawlerInput
): Promise<VisaResult> => {
  const {
    nationality,
    destination,
    language = 'en',
    maxRequestsPerCrawl = 1,
  } = input;

  const nationalityDisplay = normalizeForDisplay(nationality);
  const destinationCompare = normalizeForCompare(destination);

  const nationalitySlug = nationalityDisplay.replace(/\s+/g, '_');
  const wikiUrl = wikipediaVisaUrl(nationalitySlug);

  const additionalInfoUrls = ADDITIONAL_INFO_SECTIONS.map(s => ({
    key: s.key,
    title: s.title,
    url: `${wikiUrl}#${s.anchor}`,
  }));

  let result: VisaResult = {
    nationality: nationalityDisplay,
    destination: normalizeForDisplay(destination),
    visaType: 'Other',
    visaTypeRaw: '',
    maxStayDays: null,
    allowedStayText: null,
    stayPolicy: null,
    notes: null,
    additionalInfoUrls,
    language,
    scrapedAt: new Date().toISOString(),
    found: false,
  };

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl,
    requestHandler: async ({ $, log }) => {
      log.info('Scanning visa table');

      const table = $('table.wikitable')
        .filter((_, el) => {
          const headers = $(el)
            .find('th')
            .map((_, th) => $(th).text().toLowerCase())
            .get();

          const hasCountry = headers.some(h =>
            h.includes('country') || h.includes('region')
          );
          const hasVisa = headers.some(h => h.includes('visa'));

          return hasCountry && hasVisa;
        })
        .first();

      if (!table.length) {
        log.warning('Visa table not found');
        return;
      }

      let countryIdx = -1;
      let visaIdx = -1;
      let stayIdx = -1;
      let notesIdx = -1;

      table.find('tr').first().find('th').each((i, th) => {
        const h = $(th).text().toLowerCase();

        if (h.includes('country') || h.includes('region')) countryIdx = i;
        if (h.includes('visa')) visaIdx = i;
        if (h.includes('allowed stay')) stayIdx = i;
        if (h.includes('notes')) notesIdx = i;
      });

      if (countryIdx === -1 || visaIdx === -1) {
        log.warning('Required columns missing');
        return;
      }

      table.find('tr').slice(1).each((_, row) => {
        if (result.found) return;

        const cols = $(row).find('td');
        if (!cols.length) return;

        const countryText = $(cols[countryIdx]).text().trim();
        if (
          normalizeForCompare(countryText) !== destinationCompare
        ) {
          return;
        }

        const visaRawText = $(cols[visaIdx]).text();
        const visaParsed = parseVisaType(visaRawText);

        const stayParsed =
          stayIdx >= 0
            ? parseAllowedStay($(cols[stayIdx]).text())
            : { maxStayDays: null, allowedStayText: null, stayPolicy: null };

        const notesText =
          notesIdx >= 0
            ? cleanWikipediaText($(cols[notesIdx]).text())
            : null;

        result = {
          ...result,
          destination: normalizeForDisplay(countryText),
          visaType: visaParsed.visaType,
          visaTypeRaw: visaParsed.visaTypeRaw,
          maxStayDays: stayParsed.maxStayDays,
          allowedStayText: stayParsed.allowedStayText,
          stayPolicy: stayParsed.stayPolicy,
          notes: notesText || null,
          found: true,
          scrapedAt: new Date().toISOString(),
        };

        log.info('Match found', { country: countryText });
      });
    },
  });

  await crawler.run([{ url: wikiUrl }]);

  return result;
};
