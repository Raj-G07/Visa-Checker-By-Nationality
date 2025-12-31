import { LingoDotDevEngine } from 'lingo.dev/sdk';

export const lingo = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY!,
});
