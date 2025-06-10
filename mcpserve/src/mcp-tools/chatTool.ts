import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chat } from 'src/ai/chat';

interface ChatToolInput {
  userInput: string;
  toolName: string;
  toolOutput: any;
}

@Injectable()
export class ChatTool {
  constructor(private configService: ConfigService) {}

  async generateReply({
    userInput,
    toolOutput,
  }: ChatToolInput): Promise<string> {
    const prompt = `你是一个智能助理。请用最自然的中文回复用户，不要提及“工具”或“工具输出”：\n用户的问题：${userInput}\n补充信息：${toolOutput.result || JSON.stringify(toolOutput)}`;
    return chat(prompt);
  }
}
