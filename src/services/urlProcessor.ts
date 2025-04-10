import axios from 'axios';
import * as cheerio from 'cheerio';
import { URLContent, URLMetadata } from '../types';

export class URLProcessor {
  async fetchContent(url: string): Promise<URLContent> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLMCP/1.0; +https://urlmcp.vercel.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        responseType: 'text'
      });
      
      const html = response.data;
      const $ = cheerio.load(html, {
        xmlMode: false,
        decodeEntities: true
      });

      // Extract metadata
      const metadata: URLMetadata = {
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()),
        author: $('meta[name="author"]').attr('content'),
        lastModified: response.headers['last-modified']
      };

      // Extract title
      const title = $('title').text() || url;

      // Extract main content
      let content = '';
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Try to find main content area
      const mainSelectors = ['main', 'article', '#content', '.content', '#main', '.main'];
      let mainContent = null;
      
      for (const selector of mainSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          mainContent = element;
          break;
        }
      }
      
      // If no main content area found, use body
      content = (mainContent || $('body')).text()
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
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
