import { Request, Response } from 'express';
import { URLProcessor } from '../../services/urlProcessor';
import { ContentStore } from '../../services/contentStore';
import { SearchService } from '../../services/search';

export class MCPProtocolHandler {
  constructor(
    private urlProcessor: URLProcessor,
    private contentStore: ContentStore,
    private searchService: SearchService
  ) {}

  async handleMCPRequest(req: Request, res: Response): Promise<Response> {
    const { function_name, parameters } = req.body;

    try {
      switch (function_name) {
        case 'fetch_url_content':
          return await this.handleFetchContent(parameters, res);
        case 'search_url_content':
          return await this.handleSearchContent(parameters, res);
        case 'get_url_metadata':
          return await this.handleGetMetadata(parameters, res);
        default:
          return res.status(400).json({
            error: `Unknown function: ${function_name}`,
            available_functions: [
              'fetch_url_content',
              'search_url_content',
              'get_url_metadata'
            ]
          });
      }
    } catch (error) {
      return res.status(500).json({
        error: `Error processing MCP request: ${(error as Error).message}`
      });
    }
  }

  private async handleFetchContent(parameters: any, res: Response): Promise<Response> {
    const { url } = parameters;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    let content = await this.contentStore.get(url);
    if (!content) {
      content = await this.urlProcessor.fetchContent(url);
      await this.contentStore.save(content);
    }

    return res.json({
      type: 'success',
      data: {
        content: content.content,
        title: content.title
      }
    });
  }

  private async handleSearchContent(parameters: any, res: Response): Promise<Response> {
    const { url, query } = parameters;
    if (!url || !query) {
      return res.status(400).json({ error: 'URL and query parameters are required' });
    }

    const results = await this.searchService.search(url, query);
    return res.json({
      type: 'success',
      data: results
    });
  }

  private async handleGetMetadata(parameters: any, res: Response): Promise<Response> {
    const { url } = parameters;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const content = await this.contentStore.get(url);
    if (!content) {
      return res.status(404).json({ error: 'URL content not found' });
    }

    return res.json({
      type: 'success',
      data: content.metadata
    });
  }

  getFunctionDefinitions() {
    return {
      functions: [
        {
          name: 'fetch_url_content',
          description: 'Fetch and parse content from a URL',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to fetch content from'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'search_url_content',
          description: 'Search within the content of a URL',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to search within'
              },
              query: {
                type: 'string',
                description: 'The search query'
              }
            },
            required: ['url', 'query']
          }
        },
        {
          name: 'get_url_metadata',
          description: 'Get metadata for a URL',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to get metadata for'
              }
            },
            required: ['url']
          }
        }
      ]
    };
  }
}
