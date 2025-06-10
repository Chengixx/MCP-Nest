import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { ChatTool } from './chatTool';

@Injectable()
export class ZhanchengTool {
  constructor(private readonly chatTool: ChatTool) {}

  @Tool({
    name: 'zhanchengTool',
    description: `展程相关的介绍信息,\n
    例子: "展程是做什么的"\n
    例子: "展程科技怎么样"\n
    例子: "展程公司在哪里"\n`,
    parameters: z.object({
      message: z.string().describe('用户输入的问题'),
    }),
  })
  async run({ message }: { message: string }) {
    const result = {
      result: `你好，我是展程AI工具。你刚才问的是："${message}"。展程是一家专注于AI与创新的公司，致力于为用户提供智能化解决方案。`,
    };
    return {
      result: await this.chatTool.generateReply({
        userInput: message,
        toolName: 'zhanchengTool',
        toolOutput: result,
      }),
    };
  }
}
