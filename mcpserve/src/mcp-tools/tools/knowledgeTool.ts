import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { ChatTool } from './chatTool';
import { WarehouseService } from '../../warehouse/warehouse.service';
import { chat } from 'src/ai/chat';

@Injectable()
export class KnowledgeTool {
  constructor(
    private readonly chatTool: ChatTool,
    private readonly warehouseService: WarehouseService,
  ) {}

  @Tool({
    name: 'knowledgeTool',
    description: `结合知识库内容和用户问题进行智能问答,当你无法确定的时候，不要回复一些不确定的内容，优先使用这个工具调用知识库来回答`,
    parameters: z.object({
      message: z.string().describe('用户输入的问题'),
    }),
  })
  async run({ message }: { message: string }) {
    // 从warehouse获取知识库内容
    const knowledgeFiles = await this.warehouseService.getTempFiles();

    // 让AI选择最相关的知识库内容
    const selectPrompt = `你是一个智能知识库匹配助手。请根据用户的问题，从以下知识库中选择最相关的一个或多个内容（最多选择3个）：

        知识库列表：
        ${knowledgeFiles.map((file, index) => `${index + 1}. ${file.label}`).join('\n')}

        用户问题：${message}

        请只返回最相关的知识库编号（如：1,3），用逗号分隔。如果都不相关，返回空字符串''不是中文的空字符串！`;

    const selectedIndexes = await chat(selectPrompt);
    console.log('选中的知识库编号:', selectedIndexes);

    // 解析选中的编号
    const indexes = selectedIndexes
      .split(',')
      .map((i) => parseInt(i.trim()) - 1)
      .filter((i) => !isNaN(i) && i >= 0 && i < knowledgeFiles.length);

    // 如果没有选中任何内容，就用普通的chat工具回答
    if (indexes.length === 0) {
      const result = await chat(message);
      return {
        result: await this.chatTool.generateReply({
          userInput: message,
          toolName: 'knowledgeTool',
          toolOutput: result,
        }),
      };
    }

    // 获取选中的知识库内容
    const selectedContents = indexes.map((i) => knowledgeFiles[i]);
    const knowledgeContent = selectedContents
      .map((file) => `${file.label}:\n${file.value}`)
      .join('\n\n');

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
