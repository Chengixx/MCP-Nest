import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async create(createKnowledgeDto: CreateKnowledgeDto) {
    return this.prisma.knowledge.create({
      data: createKnowledgeDto,
    });
  }

  async findAll() {
    return this.prisma.knowledge.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const knowledge = await this.prisma.knowledge.findUnique({
      where: { id },
    });

    if (!knowledge) {
      throw new NotFoundException(`Knowledge with ID ${id} not found`);
    }

    return knowledge;
  }

  async update(id: string, updateKnowledgeDto: UpdateKnowledgeDto) {
    try {
      return await this.prisma.knowledge.update({
        where: { id },
        data: updateKnowledgeDto,
      });
    } catch (error) {
      throw new NotFoundException(`Knowledge with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      // 软删除：将 isActive 设置为 false
      return await this.prisma.knowledge.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      throw new NotFoundException(`Knowledge with ID ${id} not found`);
    }
  }

  // 搜索知识库
  async search(query: string) {
    return this.prisma.knowledge.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 