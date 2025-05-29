import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { McpController } from './mcp/mcp.controller';
import { McpService } from './mcp/mcp.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ChatController, McpController],
  providers: [ChatService, McpService],
})
export class AppModule {}
