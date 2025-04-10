import { URLContent } from '../types';

export class ContentStore {
  private store: Map<string, URLContent>;

  constructor() {
    this.store = new Map();
  }

  async save(content: URLContent): Promise<void> {
    this.store.set(content.url, content);
  }

  async get(url: string): Promise<URLContent | null> {
    return this.store.get(url) || null;
  }

  async delete(url: string): Promise<boolean> {
    return this.store.delete(url);
  }

  async list(): Promise<URLContent[]> {
    return Array.from(this.store.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
