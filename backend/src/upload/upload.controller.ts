import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { join } from 'path';
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const folderPath = join(__dirname, '../../../text/');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    cb(null, folderPath);
  },
  filename: (_, file, cb) => {
    return cb(null, Date.now() + '-' + file.originalname);
  },
});

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', { storage }))
  upload(@UploadedFile() file: Express.Multer.File) {
    console.log(file, '上传的文件');
  }

  @Post('text')
  async uploadText(@Body('content') content: string, @Body('filename') filename: string) {
    return this.uploadService.saveText(content, filename);
  }
}
