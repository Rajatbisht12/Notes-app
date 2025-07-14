import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

export async function getUrlTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    return dom.window.document.title || url;
  } catch (error) {
    return url;
  }
}