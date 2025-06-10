import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpService } from '../mcp/mcp.service';
import axios from 'axios';
import { chat } from 'src/ai/chat';

@Injectable()
export class ChatService {
  private apiKey: string;
  constructor(
    private configService: ConfigService,
    private mcpService: McpService,
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
      // 命中工具的情况下，调用工具
      try {
        let toolInput: any = {};
        toolInput = { message };
        console.log(toolName, 'ai选中的工具名toolName🐷🐷🐷');
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
