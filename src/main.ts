import { Actor, Dataset } from 'apify';
import { LingoDotDevEngine } from 'lingo.dev/sdk';

import { runVisaCrawler } from './crawler/visaTable';
import { generateVisaReportHTML } from './html/report';
import { logger } from './utils/logger';
import { VisaResult } from './types/visa';

interface Input {
  nationality: string;
  destination: string;
  language?: string;
  maxRequestsPerCrawl?: number;
}

// --------------------
// INIT
// --------------------
await Actor.init();

const input =
  (await Actor.getInput<Input>()) ?? ({} as Input);

const {
  nationality,
  destination,
  language = 'en',
  maxRequestsPerCrawl = 1,
} = input;

if (!nationality || !destination) {
  throw new Error(
    'Input must include both "nationality" and "destination".'
  );
}

logger.info('Starting visa lookup', {
  nationality,
  destination,
  language,
});

// --------------------
// SCRAPE
// --------------------
const result: VisaResult = await runVisaCrawler({
  nationality,
  destination,
  language,
  maxRequestsPerCrawl,
});

// --------------------
// LOCALIZATION
// --------------------
if (language !== 'en' && result.found) {
  try {
    const lingo = new LingoDotDevEngine({
      apiKey: process.env.LINGODOTDEV_API_KEY!,
    });

    const localizedMain = await lingo.localizeObject(
      {
        visaType: result.visaType,
        notes: result.notes,
        allowedStayText: result.allowedStayText,
      },
      {
        sourceLocale: 'en',
        targetLocale: language,
      }
    );

    result.visaType_localized = localizedMain.visaType;
    result.notes_localized = localizedMain.notes;
    result.allowedStayText_localized =
      localizedMain.allowedStayText;

    const titlesObject = Object.fromEntries(
      result.additionalInfoUrls.map((l, i) => [
        `title_${i}`,
        l.title,
      ])
    );

    const localizedTitles = await lingo.localizeObject(
      titlesObject,
      {
        sourceLocale: 'en',
        targetLocale: language,
      }
    );

    result.additionalInfoUrls =
      result.additionalInfoUrls.map((l, i) => ({
        ...l,
        title_localized: localizedTitles[`title_${i}`],
      }));

    logger.info('Localization completed', { language });
  } catch (err) {
    logger.warning('Localization failed, using English');
  }
}

// --------------------
// HTML REPORT
// --------------------
const html = generateVisaReportHTML(result);

await Actor.setValue('report.html', html, {
  contentType: 'text/html',
});

// --------------------
// DATASETS
// --------------------
const additionalInfoDataset =
  await Actor.openDataset('additional-info');

await additionalInfoDataset.drop();

if (result.found) {
  await Dataset.pushData({
    type: 'visa',
    nationality: result.nationality,
    destination: result.destination,
    visaType: result.visaType,
    visaType_localized: result.visaType_localized ?? null,
    maxStayDays: result.maxStayDays,
    allowedStayText: result.allowedStayText,
    allowedStayText_localized:
      result.allowedStayText_localized ?? null,
    stayPolicy: result.stayPolicy,
    notes: result.notes,
    notes_localized: result.notes_localized ?? null,
    language: result.language,
    found: true,
    scrapedAt: result.scrapedAt,
  });

  for (const link of result.additionalInfoUrls) {
    await additionalInfoDataset.pushData({
      type: 'additional_info',
      title: link.title,
      title_localized: link.title_localized ?? null,
      url: link.url,
      language: result.language,
      scrapedAt: result.scrapedAt,
    });
  }
} else {
  await Dataset.pushData({
    type: 'visa',
    nationality: result.nationality,
    destination: result.destination,
    found: false,
    language: result.language,
    notes:
      'Visa information not found for the provided nationality and destination.',
    scrapedAt: result.scrapedAt,
  });
}

// --------------------
// KV RESULT
// --------------------
await Actor.setValue('RESULT', result);

logger.info('Visa lookup finished', {
  found: result.found,
});

await Actor.exit();
