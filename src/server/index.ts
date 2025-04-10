import express from 'express';
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

// Serve static files and UI under /ui path
app.use('/ui', express.static(path.join(__dirname, '../public')));
app.get('/ui', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// MCP Protocol handler at root
app.post('/', async (req, res, next) => {
  try {
    await mcpProtocolHandler.handleMCPRequest(req, res);
  } catch (error) {
    next(error);
  }
});

// MCP functions endpoint
app.get('/functions', (_, res) => {
  res.json(mcpProtocolHandler.getFunctionDefinitions());
});

// Redirect root GET requests to UI
app.get('/', (_, res) => {
  res.redirect('/ui');
});

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`URL-MCP server is running on port ${port}`);
});
