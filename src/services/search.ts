import { SearchResult, URLContent } from '../types';
import { ContentStore } from './contentStore';

export class SearchService {
  constructor(private contentStore: ContentStore) {}

  async search(url: string, query: string): Promise<SearchResult[]> {
    const content = await this.contentStore.get(url);
    if (!content) {
      return [];
    }

    const words = query.toLowerCase().split(/\s+/);
    const contentWords = content.content.toLowerCase();
    
    // Simple relevance scoring based on word matches
    const matches: SearchResult[] = [];
    let pos = 0;
    
    while (pos < contentWords.length) {
      const relevance = words.reduce((score, word) => {
        return contentWords.slice(pos, pos + 200).includes(word) ? score + 1 : score;
      }, 0);

      if (relevance > 0) {
        // Find the surrounding context
        const start = Math.max(0, pos - 50);
        const end = Math.min(content.content.length, pos + 200);
        const context = content.content.slice(start, end).trim();

        matches.push({
          content: context,
          relevance,
          context: `...${context}...`
        });

        pos += 100; // Move forward to avoid overlapping matches
      } else {
        pos += 50;
      }
    }

    return matches
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5); // Return top 5 matches
  }
}
