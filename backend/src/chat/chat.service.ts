import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpService } from '../mcp/mcp.service';
import { chat } from 'src/ai/chat';
import { KnowledgeService } from 'src/knowledge/knowledge.service';

@Injectable()
export class ChatService {
  private apiKey: string;
  constructor(
    private configService: ConfigService,
    private mcpService: McpService,
    private knowledgeService: KnowledgeService,
  ) {
    this.apiKey = this.configService.get<string>('ALIYUN_API_KEY') || '';
  }
  async getAIReply(message: string) {
    // 获取 MCP 工具列表（通过 McpService）
    let tools: { name: string; description: string }[] = [];
    try {
      const res = await this.mcpService.getTools();
      tools = res.tools;
    } catch {
      // 获取失败，降级为普通对话
      const normalRes = await chat(message);
      return { reply: normalRes };
    }
    const toolListStr = tools
      .map((t) => `${t.name}: ${t.description}`)
      .join('\n');

    // 优化决策 prompt，加入更明确的匹配规则和示例
    const decisionPrompt = `你是一个智能工具选择助手。你的任务是根据用户问题选择最合适的工具。

      已注册工具如下：
      ${toolListStr}

      工具匹配规则：
        ${tools.map((t) => `${t.name}的描述信息: ${t.description}`).join('\n')}
      当前用户问题：${message}

      请严格按照以上规则和示例进行匹配，只回复工具名（如 xxxxxxTool、xxxxxxTool、xxxxxxTool）或 NONE。`;

    // console.log('决策 prompt:', decisionPrompt);
    let aiDecision = '';
    try {
      aiDecision = await chat(decisionPrompt);
    } catch {
      // 决策失败，降级为普通对话
      const normalRes = await chat(message);
      return { reply: normalRes };
    }
    // 判断命中工具
    const toolName = aiDecision;
    if (tools.some((t) => t.name === toolName)) {
      console.log(toolName, 'ai选中的工具名toolName🐷🐷🐷');
      // 命中工具的情况下，调用工具
      let toolInput: any = {};

      try {
        //知识库工具的情况下
        if (toolName === 'knowledgeTool') {
          const knowledgeList = await this.knowledgeService.findAll();
          // 让AI选择最相关的知识库内容
          const selectPrompt = `
          你是一个智能知识库匹配助手。请根据用户的问题，从以下知识库中选择最相关的一个或多个内容（最多选择3个）：

          知识库列表：
          ${knowledgeList.map((file, index) => `${index + 1}. ${file.title}`).join('\n')}

          用户问题：${message}

          请只返回最相关的知识库编号（如：1,3），用逗号分隔。如果都不相关，返回空字符串''不是中文的空字符串！`;

          const selectedIndexes = await chat(selectPrompt);
          console.log('选中的知识库编号:', selectedIndexes);

          // 解析选中的编号
          const indexes = selectedIndexes
            .split(',')
            .map((i) => parseInt(i.trim()) - 1)
            .filter((i) => !isNaN(i) && i >= 0 && i < knowledgeList.length);

          // 如果没有选中任何内容，就用普通的chat工具回答
          if (indexes.length === 0) {
            // 没有命中的话，走普通对话
            const normalRes = await chat(message);
            return { reply: normalRes };
          }

          // 获取选中的知识库内容
          const selectedContents = indexes.map((i) => knowledgeList[i]);
          const knowledgeContent = selectedContents
            .map((file) => `${file.title}:\n${file.content}`)
            .join('\n\n');

          toolInput = { knowledgeContent };
        }

        toolInput = { ...toolInput, message };
        const toolResult = await this.mcpService.callTool(toolName, toolInput);
        return { reply: toolResult?.result || '工具调用无结果' };
      } catch {
        return { reply: '工具调用失败。' };
      }
    } else {
      // 没有命中的话，走普通对话
      const normalRes = await chat(message);
      return { reply: normalRes };
    }
  }
}
