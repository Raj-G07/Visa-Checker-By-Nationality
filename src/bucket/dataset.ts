import { Dataset, Actor } from 'apify';
import { VisaResult } from '../types/visa';

export const storeVisaResult = async (result: VisaResult) => {
  await Dataset.pushData({
    type: 'visa',
    ...result,
  });
};

export const storeAdditionalInfo = async (links: VisaResult['additionalInfoUrls'], language: string, scrapedAt: string) => {
  let ds = await Actor.openDataset('additional-info');
  await ds.drop();
  ds = await Actor.openDataset('additional-info');

  for (const link of links) {
    await ds.pushData({
      type: 'additional_info',
      title: link.title,
      title_localized: link.title_localized ?? null,
      url: link.url,
      language,
      scrapedAt,
    });
  }
};
