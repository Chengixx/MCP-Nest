import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class McpService {
  private mcpClient: Client;
  private isConnected: boolean;

  constructor() {
    // 新建 MCP 实例
    this.mcpClient = new Client({
      name: 'mcp-client',
      version: '1.0.0',
    });
  }

  async connecteMcpServer() {
    // 通过 SSE 连接本地 3000 端口起的 MCP 服务器
    const transport = new SSEClientTransport(
      new URL('http://localhost:4000/sse'),
    );
    await this.mcpClient.connect(transport);
    this.isConnected = true;
    console.log('服务端连接成功 connected');
  }

  // 获取 MCP 服务提供的 resource
  async getListResources(): Promise<any> {
    if (!this.isConnected) {
      await this.connecteMcpServer();
    }
    return this.mcpClient.listResources();
  }

  // 获取 MCP 服务提供的 tools
  async getTools(): Promise<any> {
    if (!this.isConnected) {
      await this.connecteMcpServer();
    }
    return this.mcpClient.listTools();
  }

  // 调用 MCP 服务提供的 tool
  async callTool(toolName: string, args: any): Promise<any> {
    if (!this.isConnected) {
      await this.connecteMcpServer();
    }
    return this.mcpClient.callTool({
      name: toolName,
      arguments: args,
    });
  }
}
