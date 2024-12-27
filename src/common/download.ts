import { exec } from 'child_process';  // 导入 Node.js 的 child_process 模块
import os from 'os';

import fs from 'fs';
import path from 'path';


import aria2Service from '../main/service/aria2';



export async function downloadPlayUrlJson(data: any, bvid: string, cid: number, qnfnval: string) {
  try {

    const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliURL', `${bvid}_${qnfnval}`);


    const saveDir = path.join(baseSaveDir, `${cid}`);
    const savePath = path.join(saveDir, `${bvid}_${qnfnval}_${cid}.json`);



    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

    // 确保传入的 data 是对象
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data format: Expected an object.');
    }




    // 格式化 JSON 数据并写入文件
    const jsonData = JSON.stringify(data, null, 2);  // 使 JSON 格式更美观（缩进2个空格）

    fs.writeFileSync(savePath, jsonData, 'utf-8');  // 保存文件

    console.log(`JSON data saved successfully to ${savePath}`);

    return savePath; // 返回保存的路径

  } catch (error) {

    console.error('Error saving JSON data:', error);

    console.error('Error saving JSON data:', error);
    throw error;  // 重新抛出错误供调用方处理
  }
}



export async function downloadPlayUrlM4s(data: any, bvid: string, cid: number, qnfnval: string) {
  try {
    // 提取 audio_data 和 baseUrls
    const audioData = data.data.dash.audio;  // 获取 audio 数据
    const baseUrls = audioData.map((item: { baseUrl: string }) => item.baseUrl);  // 提取 baseUrl
    
    const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliURL', `${bvid}_${qnfnval}`);

    // 如果 data 数组只有一个元素，则根据 cid 创建保存目录

      const saveDir = path.join(baseSaveDir, `${cid}`);

      
      // 检查目录是否存在，不存在则创建
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }
      
      // 设置请求头
      const headers = [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Referer: https://space.bilibili.com',
      ];

      // 下载每个 baseUrl
      for (let i = 0; i < baseUrls.length; i++) {

        const uri = baseUrls[i];
        
        // 设置文件名，避免重名
        const fileName = `${bvid}_${qnfnval}_${i}.m4s`;
        
        // 调用 aria2Service 的 'addUri' 方法，传递参数进行下载
        await aria2Service.fns.invoke('aria2.addUri', [uri], {
          dir: saveDir,  // 设置下载目录
          header: headers,    // 设置 HTTP 请求头
          out: fileName,      // 设置下载文件名
        });


        console.log(`Downloading: ${uri}`);
      }
      
      console.log('Download tasks initiated for all segments.');

  } catch (error) {
    console.error('Error downloading play URL video:', error);
    throw error;  // 将错误抛给调用方
  }
}


// 获取视频的详细信息https://api.bilibili.com/x/web-interface/view