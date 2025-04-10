import axios from 'axios';
import * as cheerio from 'cheerio';
import { URLContent, URLMetadata } from '../types';

export class URLProcessor {
  async fetchContent(url: string): Promise<URLContent> {
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      // Extract metadata
      const metadata: URLMetadata = {
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()),
        author: $('meta[name="author"]').attr('content'),
        lastModified: response.headers['last-modified']
      };

      // Extract title
      const title = $('title').text() || url;

      // Extract main content (simplified version)
      const content = $('body').text()
        .replace(/\s+/g, ' ')
        .trim();

      return {
        url,
        title,
        content,
        metadata,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to fetch URL content: ${(error as Error).message}`);
    }
  }

  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
