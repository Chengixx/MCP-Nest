import axios from 'axios';

export const chat = async (prompt: string) => {
  const apiKey = process.env.ALIYUN_API_KEY || '';
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
    // console.log(response?.data?.output?.text?.trim(), '这边的回复🐷🐷🐷');
    return response?.data?.output?.text?.trim() || 'AI回复失败';
  } catch (e) {
    return 'AI回复失败，请检查API Key和网络。';
  }
};
