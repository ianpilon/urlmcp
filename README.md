# URL-MCP

URL-MCP is a service that transforms any web page into a Model Context Protocol (MCP) endpoint, enabling AI assistants to access and understand web content effortlessly.

## Features

- Transform any URL into an MCP endpoint
- Semantic search capabilities
- Metadata extraction
- Content caching
- Zero configuration required

## API Endpoints

### 1. Fetch URL Content
```
GET /api/fetch_url_content?url=<encoded-url>
```

### 2. Search URL Content
```
GET /api/search_url_content?url=<encoded-url>&query=<search-query>
```

### 3. Get URL Metadata
```
GET /api/get_url_metadata?url=<encoded-url>
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on port 3000 by default.

## Usage Example

```bash
# Fetch content from a URL
curl "http://localhost:3000/api/fetch_url_content?url=https%3A%2F%2Fexample.com"

# Search within URL content
curl "http://localhost:3000/api/search_url_content?url=https%3A%2F%2Fexample.com&query=search+term"

# Get URL metadata
curl "http://localhost:3000/api/get_url_metadata?url=https%3A%2F%2Fexample.com"
```
