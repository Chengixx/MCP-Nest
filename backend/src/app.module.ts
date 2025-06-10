import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { McpController } from './mcp/mcp.controller';
import { McpService } from './mcp/mcp.service';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    KnowledgeModule,
    PrismaModule,
  ],
  controllers: [ChatController, McpController, UploadController],
  providers: [ChatService, McpService, UploadService],
})
export class AppModule {}
