import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { ToolsModule } from './mcp-tools/tools.module';
import { GreetingTool } from './mcp-tools/tools/greetingTool';
import { ZhanchengTool } from './mcp-tools/tools/zhanchengTool';
import { KnowledgeTool } from './mcp-tools/tools/knowledgeTool';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ToolsModule,
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
})
export class AppModule {}
