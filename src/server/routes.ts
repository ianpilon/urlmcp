import { Router, RequestHandler } from 'express';
import { MCPController } from './controllers/mcp';
import { MCPProtocolHandler } from './controllers/mcp-protocol';
import { URLProcessor } from '../services/urlProcessor';
import { ContentStore } from '../services/contentStore';
import { SearchService } from '../services/search';

const router = Router();

// Initialize services
const urlProcessor = new URLProcessor();
const contentStore = new ContentStore();
const searchService = new SearchService(contentStore);

// Initialize controllers
const mcpController = new MCPController(urlProcessor, contentStore, searchService);
const mcpProtocolHandler = new MCPProtocolHandler(urlProcessor, contentStore, searchService);

// REST API routes
router.get('/fetch_url_content', mcpController.fetchUrlContent as RequestHandler);
router.get('/search_url_content', mcpController.searchUrlContent as RequestHandler);
router.get('/get_url_metadata', mcpController.getUrlMetadata as RequestHandler);

// MCP Protocol routes
router.post('/mcp', (async (req, res, next) => {
  try {
    await mcpProtocolHandler.handleMCPRequest(req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

router.get('/mcp/functions', ((_, res, next) => {
  try {
    res.json(mcpProtocolHandler.getFunctionDefinitions());
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default router;
