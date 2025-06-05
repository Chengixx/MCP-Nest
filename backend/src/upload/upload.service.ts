import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  async saveText(content: string, filename: string) {
    const folderPath = join(__dirname, '../../../text/');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const timestamp = Date.now();
    const finalFilename = `${timestamp}-${filename || 'text-input'}.txt`;
    const filePath = join(folderPath, finalFilename);

    try {
      await fs.promises.writeFile(filePath, content, 'utf8');
      return { success: true, filename: finalFilename };
    } catch (error) {
      console.error('Error saving text file:', error);
      throw new Error('Failed to save text file');
    }
  }
}
