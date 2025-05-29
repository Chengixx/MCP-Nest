import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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
    toolName,
    toolOutput,
  }: ChatToolInput): Promise<string> {
    const apiKey = this.configService.get<string>('ALIYUN_API_KEY');
    if (!apiKey || apiKey === 'YOUR_ALIYUN_API_KEY') {
      return '请在 .env 文件中配置你的阿里百炼 API KEY。';
    }
    const prompt = `你是一个智能助理。请用最自然的中文回复用户，不要提及“工具”或“工具输出”：\n用户的问题：${userInput}\n补充信息：${toolOutput.result || JSON.stringify(toolOutput)}`;
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
      console.log(response?.data?.output?.text?.trim(), '这边的回复 猪猪猪');
      return response?.data?.output?.text?.trim() || 'AI回复失败';
    } catch (e) {
      return 'AI回复失败，请检查API Key和网络。';
    }
  }
}
