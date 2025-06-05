import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GreetingTool } from './tools/greetingTool';
import { ZhanchengTool } from './tools/zhanchengTool';
import { KnowledgeTool } from './tools/knowledgeTool';
import { ChatTool } from './tools/chatTool';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [ConfigModule, WarehouseModule],
  providers: [GreetingTool, ZhanchengTool, KnowledgeTool, ChatTool],
  exports: [GreetingTool, ZhanchengTool, KnowledgeTool, ChatTool],
})
export class ToolsModule {}
