import express from 'express';
import type { Request, Response, RequestHandler, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { URLProcessor } from '../services/urlProcessor';
import { ContentStore } from '../services/contentStore';
import { SearchService } from '../services/search';
import { MCPProtocolHandler } from './controllers/mcp-protocol';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const urlProcessor = new URLProcessor();
const contentStore = new ContentStore();
const searchService = new SearchService(contentStore);
const mcpProtocolHandler = new MCPProtocolHandler(urlProcessor, contentStore, searchService);

// Create API router
const apiRouter = express.Router();

// API routes
const fetchUrlContent: RequestHandler = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is required' });
      return;
    }
    const content = await urlProcessor.fetchContent(url);
    res.json({ success: true, data: content });
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
};

const searchUrlContent: RequestHandler = async (req, res) => {
  try {
    const { url, query } = req.query;
    if (!url || typeof url !== 'string' || !query || typeof query !== 'string') {
      res.status(400).json({ error: 'URL and query parameters are required' });
      return;
    }
    const results = await searchService.search(url, query);
    res.json({ success: true, data: results });
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
};

const getUrlMetadata: RequestHandler = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is required' });
      return;
    }
    const content = await contentStore.get(url);
    if (!content) {
      res.status(404).json({ error: 'URL content not found' });
      return;
    }
    res.json({ success: true, data: content.metadata });
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
};

apiRouter.get('/fetch_url_content', fetchUrlContent);
apiRouter.get('/search_url_content', searchUrlContent);
apiRouter.get('/get_url_metadata', getUrlMetadata);

// MCP Protocol handler at root
app.post('/mcp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mcpProtocolHandler.handleMCPRequest(req, res);
  } catch (error) {
    next(error);
  }
});

// MCP functions endpoint
app.get('/mcp/functions', (_: Request, res: Response) => {
  res.json(mcpProtocolHandler.getFunctionDefinitions());
});

// Health check
app.get('/mcp/health', (_: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Mount API router
app.use('/api', apiRouter);

// Serve static files and UI under root path
app.use('/', express.static(path.join(__dirname, '../public')));

// Serve index.html for root route
app.get('/', (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`URL-MCP server is running on port ${port}`);
});
