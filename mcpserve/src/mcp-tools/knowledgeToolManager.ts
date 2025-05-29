import * as fs from 'fs';
import * as path from 'path';

export interface KnowledgeFileMeta {
  fileName: string;
  filePath: string;
  description: string;
}

export class KnowledgeToolManager {
  private static instance: KnowledgeToolManager;
  private knowledgeFiles: KnowledgeFileMeta[] = [];
  private readonly tempDir: string;

  private constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.refreshKnowledgeFiles();
  }

  public static getInstance(): KnowledgeToolManager {
    if (!KnowledgeToolManager.instance) {
      KnowledgeToolManager.instance = new KnowledgeToolManager();
    }
    return KnowledgeToolManager.instance;
  }

  // 扫描 temp 目录，刷新知识库文件列表
  public refreshKnowledgeFiles() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    const files = fs.readdirSync(this.tempDir).filter(f => f.endsWith('.txt'));
    this.knowledgeFiles = files.map(file => ({
      fileName: file,
      filePath: path.join(this.tempDir, file),
      description: `基于知识库文件 ${file} 进行智能问答`,
    }));
  }

  // 新增知识库文件（上传后调用）
  public addKnowledgeFile(fileName: string) {
    this.refreshKnowledgeFiles();
  }

  // 删除知识库文件（删除后调用）
  public removeKnowledgeFile(fileName: string) {
    this.refreshKnowledgeFiles();
  }

  // 获取所有知识库元信息
  public getAllKnowledgeFiles(): KnowledgeFileMeta[] {
    this.refreshKnowledgeFiles();
    return this.knowledgeFiles;
  }
} 