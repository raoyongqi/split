import path from 'path';  // 引入 path 模块来处理路径
import os from 'os'; // 引入 os 模块来处理操作系统相关的路径
import fs from 'fs'; // 引入 fs 模块来处理文件系统操作
import { exec } from 'child_process'; // 引入 child_process 来执行 ffmpeg 命令
import { useLogger } from '../../common/logger';
import { app } from 'electron';  // 引入 electron 的 app 模块
const { logger } = useLogger('silly');

import {getBinPath} from '../util';


// 合并 m4s 文件并删除原文件的函数
export async function mergeM4sToM4a(data: any, bvid: string,cid: number, qnfnval: string) {
 

  
  const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliURL', `${bvid}_${qnfnval}`);
  const saveDir = path.join(baseSaveDir, `${cid}`);
  // 确保目标文件夹存在
  if (!fs.existsSync(saveDir)) {
    return { error: '文件夹不存在', details: `指定的文件夹 ${saveDir} 不存在。` };
  }

  // 读取目录下所有文件并筛选出 .m4s 文件
  const files = fs.readdirSync(saveDir);
  const m4sFiles = files
    .filter(file => file.endsWith('.m4s'))
    .map(file => path.join(saveDir, file)); // 获取完整路径

  // 如果没有找到任何 .m4s 文件
  if (m4sFiles.length === 0) {
    return { error: '文件不存在', details: `没有找到 ${bvid} ${cid} 对应的 .m4s 文件。` };
  }


  // 输出文件路径 (合并后的 .m4a 文件)
  const outputFileName = `${bvid}_${cid}.m4a`;
  const outputPath = path.join(saveDir, outputFileName);

  try {
    // 获取 ffmpeg 二进制路径
    const ffmpegPath = getBinPath('ffmpeg');

    // 拼接命令使用 concat 协议
    const concatFiles = m4sFiles.join('|');  // 使用管道符连接文件路径
    const command = `"${ffmpegPath}" -i "concat:${concatFiles}" -c:a aac -strict experimental "${outputPath}"`;
    
    logger.info(`Running ffmpeg command: ${command}`);

    // 使用 child_process 执行 ffmpeg 命令
    const result = await new Promise<any>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error('ffmpeg error:', error);
          return reject({ error: '合并失败', details: error });
        }
        if (stderr) {
          logger.error('ffmpeg stderr:', stderr);
        }
        logger.info('ffmpeg stdout:', stdout);
        resolve({ message: '合并成功', output: outputPath });
      });
    });

    // 删除原目录下的所有 .m4s 文件
    m4sFiles.forEach(file => {
      try {
        fs.unlinkSync(file); // 删除每个 .m4s 文件
        logger.info(`Deleted: ${file}`);
      } catch (error) {
        logger.error(`Error deleting file: ${file}`, error);
      }
    });

    // 返回合并结果
    return result;

  } catch (error) {
    logger.error('Merge failed:', error);
    // 返回错误信息
    return { error: '合并失败', details: error };
  }
}
