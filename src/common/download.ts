import { exec } from 'child_process';  // 导入 Node.js 的 child_process 模块
import os from 'os';

import fs from 'fs';
import path from 'path';


import aria2Service from '../main/service/aria2';

import {mergeM4sToM4a,mergeM4sPlay} from '../main/service/ff';

import { useLogger } from '../common/logger';



const { logger } = useLogger('silly');

export async function downloadPlayUrlJson(data: any, bvid: string, cid: number, qnfnval: string) {
  try {

    const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliURL',`${bvid}`, `${bvid}_${qnfnval}`);


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


    return savePath; // 返回保存的路径

  } catch (error) {

    console.error('Error saving JSON data:', error);

    console.error('Error saving JSON data:', error);
    throw error;  // 重新抛出错误供调用方处理
  }
}


export async function downloadPlayUrlSearch(data: any, search: string,bvid: string, cid: number, qnfnval: string) {
  try {

    const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliSearch',`${search}`,`${bvid}`, `${bvid}_${qnfnval}`);


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


    return savePath; // 返回保存的路径

  } catch (error) {

    logger.error('Error saving JSON data:', error);
    throw error;  // 重新抛出错误供调用方处理
  }
}



export async function downloadPlayUrlM4s(data: any, bvid: string, cid: number, qnfnval: string) {
  try {


    // 提取 audio_data 和 baseUrls
    const audioData = data.data.dash.audio;  // 获取 audio 数据
    const baseUrls = audioData.map((item: { baseUrl: string }) => item.baseUrl);  // 提取 baseUrl
    
    const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliURL',`${bvid}`, `${bvid}_${qnfnval}`);

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

    // 保存每个任务的 GID
    const downloadGids: string[] = [];

    // 下载每个 baseUrl 并获取其 GID
    for (let i = 0; i < baseUrls.length; i++) {
      const uri = baseUrls[i];
      const fileName = `${bvid}_${qnfnval}_${i}.m4s`;

      // 调用 aria2Service 的 'addUri' 方法，传递参数进行下载
      const gid = await aria2Service.fns.invoke('aria2.addUri', [uri], {
        dir: saveDir,  // 设置下载目录
        header: headers,    // 设置 HTTP 请求头
        out: fileName,      // 设置下载文件名
      });

      // 保存 GID 以便后续检查状态
      downloadGids.push(gid);
    }

    // 等待所有下载完成
    await waitForAllDownloads(downloadGids);

    // 下载完成后，调用合并函数


    return await mergeM4sToM4a(data, bvid, cid, qnfnval);

  } catch (error) {
    logger.error('Error downloading play URL video:', error);
    throw error;  // 将错误抛给调用方
  }
}
export async function downloadM4sPlay(data: any, search: string,bvid: string, cid: number, qnfnval: string) {
  try {


    // 提取 audio_data 和 baseUrls
    const audioData = data.data.dash.audio;  // 获取 audio 数据
    const baseUrls = audioData.map((item: { baseUrl: string }) => item.baseUrl);  // 提取 baseUrl
    
    const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliSearch',`${search}`,`${bvid}`, `${bvid}_${qnfnval}`);

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

    // 保存每个任务的 GID
    const downloadGids: string[] = [];
    // 下载每个 baseUrl 并获取其 GID
    for (let i = 0; i < baseUrls.length; i++) {
      const uri = baseUrls[i];
      const fileName = `${bvid}_${qnfnval}_${i}.m4s`;

      // 调用 aria2Service 的 'addUri' 方法，传递参数进行下载
      const gid = await aria2Service.fns.invoke('aria2.addUri', [uri], {
        dir: saveDir,  // 设置下载目录
        header: headers,    // 设置 HTTP 请求头
        out: fileName,      // 设置下载文件名
      });

      // 保存 GID 以便后续检查状态
      downloadGids.push(gid);
    }

    // 等待所有下载完成
    await waitForAllDownloads(downloadGids);

    // 下载完成后，调用合并函数


    return await mergeM4sPlay(data, search,bvid, cid, qnfnval);

  } catch (error) {
    logger.error('Error downloading play URL video:', error);
    throw error;  // 将错误抛给调用方
  }
}
// 等待所有下载完成的函数
// 等待所有下载完成的函数
const waitForAllDownloads = async (downloadGids: string[]) => {
  // 遍历所有 GID，检查每个下载任务的状态
  for (const gid of downloadGids) {
    await checkStatus(gid);  // 对每个下载任务调用 checkStatus
  }

};

// 单独的状态检查函数
const checkStatus = async (gid: string) => {
  try {
    const status = await aria2Service.fns.invoke('aria2.tellStatus', gid, ["gid", "status"]);
    const currentStatus = status.status; // 获取当前任务的状态
    
    if (currentStatus === 'active' || currentStatus === 'waiting') {
      // 如果任务正在下载或等待中，继续检查状态
      // 递归调用 checkStatus，直到下载完成
      await checkStatus(gid);
    } else if (currentStatus === 'complete') {
      // 如果任务完成，输出完成信息
    } else {
      // 如果任务是暂停或其他状态，处理相应的逻辑
    }
  } catch (error) {
    logger.error(`Error checking status for GID: ${gid}`, error);
  }
};


// 获取视频的详细信息https://api.bilibili.com/x/web-interface/view

export async function saveVideoDetails(bvid: string, videoDetails: any) {


  const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliURL', bvid);

  // 获取当前时间戳，作为文件名的一部分
  const filePath = path.join(baseSaveDir, `${bvid}.json`); // 保存文件路径

  // 确保保存路径存在
  if (!fs.existsSync(baseSaveDir)) {
    fs.mkdirSync(baseSaveDir, { recursive: true });
  }

  // 将视频详情保存为 JSON 文件
  fs.writeFileSync(filePath, JSON.stringify(videoDetails, null, 2), 'utf8');

  
}



export async function saveVideoDetailsPlay(search: string, bvid: string, videoDetails: any) {
  const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliSearch', `${search}`, `${bvid}`);

  // 获取当前时间戳，作为文件名的一部分
  const filePath = path.join(baseSaveDir, `${bvid}.json`); // 保存文件路径

  // 检查是否已存在文件，如果存在则跳过下载
  if (fs.existsSync(filePath)) {
    console.log(`文件 ${filePath} 已存在，跳过下载步骤。`);
    return; // 文件已存在，跳过下载
  }

  // 确保保存路径存在
  if (!fs.existsSync(baseSaveDir)) {
    fs.mkdirSync(baseSaveDir, { recursive: true });
  }

  // 将视频详情保存为 JSON 文件
  fs.writeFileSync(filePath, JSON.stringify(videoDetails, null, 2), 'utf8');
  console.log(`文件已保存到 ${filePath}`);
}


