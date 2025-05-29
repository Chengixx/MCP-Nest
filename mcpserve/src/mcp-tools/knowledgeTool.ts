import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { ChatTool } from './chatTool';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class KnowledgeTool {
  constructor(private readonly chatTool: ChatTool) {}

  @Tool({
    name: 'knowledgeTool',
    description: '结合知识库内容（自动读取temp/1.txt）和用户问题进行智能问答',
    parameters: z.object({
      message: z.string().describe('用户输入的问题'),
    }),
  })
  async run({ message }: { message: string }) {
    // 自动读取知识库内容
    const filePath = path.join(__dirname, '../../temp/1.txt');
    let fileContent = '';
    try {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } catch {
      fileContent = '知识库文件不存在或读取失败。';
    }
    const result = { result: `知识库内容：${fileContent}\n用户问题：${message}\n请结合知识库内容进行智能回答。` };
    return {
      result: await this.chatTool.generateReply({
        userInput: message,
        toolName: 'knowledgeTool',
        toolOutput: result,
      }),
    };
  }
} 