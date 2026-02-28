// ClawPazar – MCP Types
// JSON-RPC 2.0 + Model Context Protocol type definitions

// ============================================================
// JSON-RPC 2.0
// ============================================================

export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: JsonRpcError;
}

export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}

// ============================================================
// MCP Protocol
// ============================================================

export interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, McpSchemaProperty>;
        required?: string[];
    };
}

export interface McpSchemaProperty {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    enum?: string[];
    items?: { type: string };
    default?: unknown;
}

export interface McpToolResult {
    content: McpContent[];
    isError?: boolean;
}

export interface McpContent {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
}

// ============================================================
// MCP Server Info
// ============================================================

export interface McpServerInfo {
    name: string;
    version: string;
    protocolVersion: string;
    capabilities: {
        tools?: { listChanged?: boolean };
        resources?: { subscribe?: boolean; listChanged?: boolean };
    };
}

// ============================================================
// MCP Standard Methods
// ============================================================

export const MCP_METHODS = {
    INITIALIZE: 'initialize',
    TOOLS_LIST: 'tools/list',
    TOOLS_CALL: 'tools/call',
    RESOURCES_LIST: 'resources/list',
    RESOURCES_READ: 'resources/read',
    PING: 'ping',
} as const;
