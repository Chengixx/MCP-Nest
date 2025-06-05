const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const shell = os.platform() === 'win32' ? 'cmd.exe' : '/bin/zsh';

// 定义需要安装依赖的目录
const dirs = [
  {
    name: "Frontend",
    cwd: path.join(__dirname, "..", "frontend"),
  },
  {
    name: "Backend",
    cwd: path.join(__dirname, "..", "backend"),
  },
  {
    name: "MCP Server",
    cwd: path.join(__dirname, "..", "mcpserve"),
  },
];

// 依次安装依赖
async function installDeps() {
  for (const dir of dirs) {
    console.log(`正在为 ${dir.name} 安装依赖🚀🚀🚀`);
    
    const child = spawn("pnpm", ["install"], {
      cwd: dir.cwd,
      stdio: "inherit",
      shell: shell,
    });

    // 等待安装完成
    await new Promise((resolve, reject) => {
      child.on("error", (error) => {
        console.error(`${dir.name} 安装依赖时出错🐷🐷🐷:`, error);
        reject(error);
      });

      child.on("exit", (code) => {
        if (code === 0) {
          console.log(`${dir.name} 依赖安装完成✨✨✨`);
          resolve();
        } else {
          console.error(`${dir.name} 依赖安装失败，退出代码 ${code}🐷🐷🐷`);
          reject(new Error(`Installation failed with code ${code}`));
        }
      });
    });
  }
}

// 执行安装
installDeps().catch((error) => {
  console.error("安装过程中出现错误:", error);
  process.exit(1);
});
