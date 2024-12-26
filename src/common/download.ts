import { exec } from 'child_process';  // 导入 Node.js 的 child_process 模块
import os from 'os';

import fs from 'fs';
import path from 'path';
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




export async function downloadPlayUrlJson(data: any, bvid: string, qnfnval: string) {
  try {
    // 构建保存路径
    const saveDir = path.join(os.homedir(), 'Music', 'bilibiliURL', bvid);
    const savePath = path.join(saveDir, `${bvid}_${qnfnval}.json`);

    // 检查目录是否存在，不存在则创建
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // 格式化 JSON 数据（增加缩进）
    const jsonData = JSON.stringify(data, null, 2);

    // 写入文件
    fs.writeFileSync(savePath, jsonData, 'utf-8');
    
    console.log(`JSON data saved successfully to ${savePath}`);


    return savePath; // 返回保存的路径
  } catch (error) {
    console.error('Error saving JSON data:', error);
    throw error; // 抛出错误以供调用方处理
  }
}