export interface URLContent {
  url: string;
  title: string;
  content: string;
  metadata: URLMetadata;
  timestamp: number;
}

export interface URLMetadata {
  description?: string;
  keywords?: string[];
  author?: string;
  lastModified?: string;
}

export interface SearchResult {
  content: string;
  relevance: number;
  context: string;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}
