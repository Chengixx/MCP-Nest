import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import z from 'zod';
import { ChatTool } from './chatTool';

@Injectable()
export class GreetingTool {
  constructor(private readonly chatTool: ChatTool) {}

  @Tool({
    name: 'greetingTool',
    description: `打招呼的信息,\n
    例子: "你好"\n
    例子: "早上好"\n`,
    parameters: z.object({
      name: z.string().default('world').describe('用户的名字'),
    }),
  })
  async greet({ message }: { message: string }) {
    const result = { result: `Hello, ${message}!` };
    return {
      result: await this.chatTool.generateReply({
        userInput: message,
        toolName: 'greetingTool',
        toolOutput: result,
      }),
    };
  }
}
