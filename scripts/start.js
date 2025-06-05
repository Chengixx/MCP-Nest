//确实是懒得改monorepo了 直接凑合用这个脚本吧
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

// 获取正确的 shell 路径
const shell = os.platform() === 'win32' ? 'cmd.exe' : '/bin/zsh';

// 定义各个服务的启动命令
const services = [
  {
    name: "Frontend",
    command: "pnpm",
    args: ["run", "dev"],
    cwd: path.join(__dirname, "..", "frontend"),
  },
  {
    name: "Backend",
    command: "pnpm",
    args: ["run", "start:dev"],
    cwd: path.join(__dirname, "..", "backend"),
  },
  {
    name: "MCP Server",
    command: "pnpm",
    args: ["run", "start:dev"],
    cwd: path.join(__dirname, "..", "mcpserve"),
  },
];

// 启动所有服务
services.forEach((service) => {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: "inherit",
    shell: shell,
  });

  console.log(`正在打开 ${service.name}🚀🚀🚀`);

  child.on("error", (error) => {
    console.error(`启动 ${service.name} 时出错🐷🐷🐷:`, error);
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${service.name} 退出，代码 ${code}🐷🐷🐷`);
    }
  });
});

// 处理进程退出
process.on("SIGINT", () => {
  console.log("\n优雅地关闭所有服务🤺🤺🤺");
  process.exit(0);
});

console.log("所有服务正在启动🚀🚀🚀");
 