import { exec } from 'child_process';  // 导入 Node.js 的 child_process 模块

export async function downloadAudioWithAria2(url: string, fileName: string): Promise<void> {
  try {
    // 构造 aria2c 的命令行参数
    const command = `aria2c -o ${fileName} ${url}`;

    // 使用 exec 执行 aria2c 命令
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`下载音频时发生错误: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`aria2c 错误: ${stderr}`);
        return;
      }

      // 输出 aria2c 的正常信息
      console.log(`音频下载成功: ${fileName}`);
      console.log(stdout);
    });
  } catch (error) {
    console.error('调用 aria2c 下载音频失败:', error);
  }
}

