import { Request, Response } from 'express';
import { URLProcessor } from '../../services/urlProcessor';
import { ContentStore } from '../../services/contentStore';
import { SearchService } from '../../services/search';
import { MCPResponse } from '../../types';

export class MCPController {
  constructor(
    private urlProcessor: URLProcessor,
    private contentStore: ContentStore,
    private searchService: SearchService
  ) {}

  fetchUrlContent = async (req: Request, res: Response) => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'URL parameter is required'
        } as MCPResponse);
      }

      if (!this.urlProcessor.validateURL(url)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format'
        } as MCPResponse);
      }

      // Check if content is already cached
      let content = await this.contentStore.get(url);
      
      if (!content) {
        content = await this.urlProcessor.fetchContent(url);
        await this.contentStore.save(content);
      }

      res.json({
        success: true,
        data: content
      } as MCPResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error processing URL: ${(error as Error).message}`
      } as MCPResponse);
    }
  };

  searchUrlContent = async (req: Request, res: Response) => {
    try {
      const { url, query } = req.query;

      if (!url || typeof url !== 'string' || !query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'URL and query parameters are required'
        } as MCPResponse);
      }

      const results = await this.searchService.search(url, query);

      res.json({
        success: true,
        data: results
      } as MCPResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error searching content: ${(error as Error).message}`
      } as MCPResponse);
    }
  };

  getUrlMetadata = async (req: Request, res: Response) => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'URL parameter is required'
        } as MCPResponse);
      }

      const content = await this.contentStore.get(url);

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'URL content not found'
        } as MCPResponse);
      }

      res.json({
        success: true,
        data: content.metadata
      } as MCPResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching metadata: ${(error as Error).message}`
      } as MCPResponse);
    }
  };
}
