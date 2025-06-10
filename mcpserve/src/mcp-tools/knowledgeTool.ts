import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { ChatTool } from './chatTool';
import { chat } from 'src/ai/chat';

@Injectable()
export class KnowledgeTool {
  constructor(private readonly chatTool: ChatTool) {}

  @Tool({
    name: 'knowledgeTool',
    description: `结合知识库内容和用户问题进行智能问答,当你无法确定的时候，不要回复一些不确定的内容，优先使用这个工具调用知识库来回答`,
    parameters: z.object({
      message: z.string().describe('用户输入的问题'),
    }),
  })
  async run({
    message,
    knowledgeContent,
  }: {
    message: string;
    knowledgeContent: string;
  }) {
    // 使用选中的知识库内容回答问题，一定要加中文 不然傻子ai老莫名其妙的
    const answerPrompt = `你是一个智能问答助手。请根据以下知识库内容，回答用户的问题。
      如果知识库内容不足以回答，请说明无法回答，不要编造信息。

      知识库内容：
      ${knowledgeContent}

      用户问题：${message}

      请用自然的中文回答，不要提及"知识库"或"内容"等词。`;

    const result = {
      result: await chat(answerPrompt),
    };

    return {
      result: await this.chatTool.generateReply({
        userInput: message,
        toolName: 'knowledgeTool',
        toolOutput: result,
      }),
    };
  }
}
