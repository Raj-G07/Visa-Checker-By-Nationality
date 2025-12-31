import { Actor } from 'apify';

export const storeKVResult = async (result: any) => {
  await Actor.setValue('RESULT', result);
};

export const storeHTMLReport = async (html: string) => {
  await Actor.setValue('report.html', html, { contentType: 'text/html' });
};
