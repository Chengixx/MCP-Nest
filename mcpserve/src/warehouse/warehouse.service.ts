import { Injectable } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { chat } from 'src/ai/chat';

@Injectable()
export class WarehouseService {
  async getTempFiles() {
    try {
      const tempDir = join(__dirname, '../../../text');
      const files = await readdir(tempDir);
      const txtFiles = files.filter((file) => file.endsWith('.txt'));
      const result = await Promise.all(
        txtFiles.map(async (file) => {
          const filePath = join(tempDir, file);
          const content = await readFile(filePath, 'utf-8');
          const label = await chat(
            `你是一个智能助理。请用最自然的中文回复，
            知识库的内容是：${content}，
            请用一句话概括这个知识库的内容,可以是一句话也可以是一个标题，
            但要记得能让ai理解这个知识库的内容`,
          );

          return {
            label,
            value: content.trim(),
          };
        }),
      );

      return result;
    } catch (error) {
      console.error('Error reading temp files:', error);
      return [];
    }
  }
}
