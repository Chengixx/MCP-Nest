import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { GreetingTool } from './mcp-tools/greetingTool';
import { ZhanchengTool } from './mcp-tools/zhanchengTool';
import { KnowledgeTool } from './mcp-tools/knowledgeTool';
import { ChatTool } from './mcp-tools/chatTool';

@Module({
  imports: [
    ConfigModule.forRoot(),
    McpModule.forRoot({
      name: 'mcp-server-demo',
      version: '1.0.0',
      transport: McpTransportType.SSE,
      sseEndpoint: '/sse',
      messagesEndpoint: '/messages',
      capabilities: {
        tools: {
          GreetingTool,
          ZhanchengTool,
          KnowledgeTool,
        },
        resources: {},
        prompts: {},
      },
    }),
  ],
  providers: [GreetingTool, ZhanchengTool, KnowledgeTool, ChatTool],
})
export class AppModule {}
