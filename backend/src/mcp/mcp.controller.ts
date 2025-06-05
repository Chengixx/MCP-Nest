import { Body, Controller, Get, Post } from '@nestjs/common';
import { McpService } from './mcp.service';

interface IToolParams {
  toolName: string;
  input: any;
}

@Controller()
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  // 获取 MCP 服务提供的 resourceList
  @Get('/resources')
  getResources(): any {
    return this.mcpService.getListResources();
  }

  // 获取 MCP 服务提供的 toolList
  @Get('/tools')
  getTools(): any {
    return this.mcpService.getTools();
  }

  //调用 MCP 服务提供的 tool
  @Post('/callTool')
  callTool(@Body() toolParams: IToolParams): any {
    return this.mcpService.callTool(toolParams.toolName, toolParams.input);
  }
}
