import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpService } from '../mcp/mcp.service';
import axios from 'axios';

@Injectable()
export class ChatService {
  constructor(
    private configService: ConfigService,
    private mcpService: McpService,
  ) {}

  private getFileContent() {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../', 'temp', '1.txt');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  }

  async getAIReply(message: string, knowledge?: string) {
    //找到backend下的temp的chat.txt文件，用绝对路径吧
    const fileContent = this.getFileContent();

    const apiKey = this.configService.get<string>('ALIYUN_API_KEY');
    if (!apiKey || apiKey === 'YOUR_ALIYUN_API_KEY') {
      return { reply: '请在 .env 文件中配置你的阿里百炼 API KEY。' };
    }

    // 获取 MCP 工具列表（通过 McpService）
    let tools: { name: string; description: string }[] = [];
    try {
      const res = await this.mcpService.getTools();
      tools = res.tools;
    } catch {
      // 获取失败，降级为普通对话
      const normalRes = await this.callAliyunModel(message, apiKey);
      return { reply: normalRes };
    }
    const toolListStr = tools
      .map((t) => `${t.name}: ${t.description}`)
      .join('\n');

    // 让AI判断是否用工具
    const decisionPrompt = `你是一个智能助手。已注册工具如下：\n${toolListStr}\n用户问题："${message}"\n如果你需要用某个工具来回答，请只回复工具名（如 greetingTool 或 zhanchengTool），否则请只回复 NONE。`;
    let aiDecision = '';
    try {
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          model: 'qwen-turbo',
          input: { prompt: decisionPrompt },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      aiDecision = response?.data?.output?.text?.trim() || '';
    } catch {
      // 决策失败，降级为普通对话
      const normalRes = await this.callAliyunModel(message, apiKey);
      return { reply: normalRes };
    }
    // 判断命中工具
    const toolName = aiDecision;
    if (tools.some((t) => t.name === toolName)) {
      // 命中工具的情况下，调用工具
      try {
        let toolInput: any = {};
        // if (toolName === 'zhanchengTool') {
        toolInput = { message };
        // }
        console.log(toolInput, 'toolInput');
        console.log(toolName, 'toolName');
        const toolResult = await this.mcpService.callTool(toolName, toolInput);
        return { reply: toolResult?.result || '工具调用无结果' };
      } catch {
        return { reply: '工具调用失败。' };
      }
    } else {
      // 没有命中的话，走普通对话
      const normalRes = await this.callAliyunModel(message, apiKey);
      return { reply: normalRes };
    }
  }

  private async callAliyunModel(
    prompt: string,
    apiKey: string,
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          model: 'qwen-turbo',
          input: { prompt },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response?.data?.output?.text?.trim() || '';
    } catch {
      return 'AI回复失败，请检查API Key和网络。';
    }
  }
}
