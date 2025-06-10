import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 