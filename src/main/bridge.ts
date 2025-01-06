import { ipcMain } from 'electron';

import axios from 'axios';

import {loginWithPassword,loginWithSmsCode,loginWithCookie} from '../common/login';

import sendSms from '../common/send';

import { useLogger } from '../common/logger';
import { downloadPlayUrlJson } from '../common/download';

import os from 'os';

import { TestProxy } from './test-proxy';

import fs from 'fs';
import path from 'path';

import aria2Service from './service/aria2';


import {getPageInfo,getSearchVideo,getCidByAid,getCidByBvid,getVideoDetails,getPlayUrlSig, getPlayUrlSearch} from '../common/info';

const { logger } = useLogger('silly');



import {getCookieString,downloadCookie } from'../common/cookie';


export function initBridge() {

  ipcMain.handle('captcha', async () => {
    const response = await axios.get('https://passport.bilibili.com/x/passport-login/captcha?source=main_web');
    return response.data;
  });

  ipcMain.handle('salt', async () => {
    try {
      const response = await fetch('https://passport.bilibili.com/x/passport-login/web/key');
      const data = await response.json();
      return data; // 将数据返回给渲染进程
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // 如果出错，抛出错误
    }
  });

  // 在主进程中使用 ipcMain.handle 处理 SMS 发送请求
  ipcMain.handle('sms', async (event, cid, phoneNumber, captcha) => {
    return await sendSms(cid, phoneNumber, captcha);
  });

  ipcMain.handle('login_sms', async (event, cid,phoneNumber,code,captchaKey) => {
    return await loginWithSmsCode(cid,phoneNumber,code,captchaKey);
  });


  ipcMain.handle('test_proxy', async () => {
    return await TestProxy();
  });


  ipcMain.handle('login_password', async (event, username: string, password: string, captcha: any) => {

    return await loginWithPassword(username, password, captcha); // 将结果返回给渲染进程

  });

  ipcMain.handle('login-with-cookie', async (event, cookieString: string) => {

      return await loginWithCookie(cookieString); // 返回登录结果

  });


  ipcMain.handle('get-cookies', async () => {

      return await getCookieString(); // 返回给渲染进程
  });

// 处理 get-cookie 下载请求
ipcMain.handle('download-cookies', async () => {

    return await downloadCookie(); // 返回保存的文件路径
 
});

ipcMain.handle('get-page-info', async (event, num: number) => {
    return await getPageInfo(num);  // 返回数据给渲染进程
});

ipcMain.handle('get-search-video', async (event, keyword: string,page: number) => {
  return await getSearchVideo(keyword,page);  // 返回数据给渲染进程
});




ipcMain.handle('save-search', (event, search) => {
  // 直接指定文件保存路径
  const filePath = path.join(__dirname, '..', '..', 'common', 'search.txt'); // 设置保存路径

  const tempPath = `${filePath}.tmp`;

  // 保存文件
  fs.writeFile(tempPath, search, 'utf8', (err) => {
    if (err) {
      logger.error('Failed to write to temp file:', err);
      return;
    }

    fs.rename(tempPath, filePath, (err) => {
      if (err) {
        logger.error('Failed to replace the original file:', err);
      } else {
        logger.info(typeof filePath);

        logger.info(filePath);
      }
    });
  });
});




ipcMain.handle('read-search', async () => {
  const filePath = path.join(__dirname, '..', '..', 'common', 'search.txt');

  return new Promise<string[]>((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
      if (err) {
        reject(err);
      } else {
        // Split by newline, trim each line, and filter out any empty lines
        const lines = data
          .split('\n') // Split the content into lines
          .map(line => line.trim()) // Trim whitespace from each line
          .filter(line => line.length > 0); // Remove empty lines

        resolve(lines); // Resolve with the filtered lines
      }
    });
  });
});



ipcMain.handle('fetch-download-link', async (event, url) => {
  // 模拟处理逻辑
  if (url.startsWith('https://example.com/')) {
    return `${url}/download-link`; // 模拟返回下载链接
  } else {
    throw new Error('无效的 URL，请重新输入！');
  }
});

ipcMain.handle('aid-cid', async (event, aid: number) => {
  return await getCidByAid(aid);
});


ipcMain.handle('bvid-cid', async (event, bvid:string) => {
  
  return await getCidByBvid(bvid);

});


ipcMain.handle('play-url', async (event, bvid:string,qn:number,fnval:number) => {
  
  return await getPlayUrlSig(bvid,qn,fnval);

});

ipcMain.handle('play-search', async (event, search:string,bvid:string,qn:number,fnval:number) => {

  return await getPlayUrlSearch(search,bvid,qn,fnval);

});

ipcMain.handle('download-play-json', async (event, data:any,bvid:string,qnfnval:string) => {
  
  return await downloadPlayUrlJson(data,bvid,1,qnfnval);

});


//
ipcMain.handle('aria2.addUri', async (_, uri: string) => {
  try {
    const downloadDir = 'C:\\Users\\r\\Music\\bilibiliM4s';  // 指定下载目录

    // 检查目录是否存在，如果不存在则创建
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // 创建请求头
    const headers = [
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      'Referer: https://space.bilibili.com',
      
    ];

    // 调用 aria2Service 中的 'addUri' 方法，传递参数
    const result = await aria2Service.fns.invoke('aria2.addUri', [uri], {
      dir: downloadDir,    // 设置下载目录
      header: headers,  
      out: 'fileName',       // 设置固定的下载文件名 // 设置 HTTP 请求头
    });

    return result;
  } catch (error) {
    console.error('Error in aria2.addUri:', error);
    throw error;  // 将错误抛给渲染进程
  }
});

ipcMain.handle('get-video-details', async (event, bvid) => {
  try {
    // 调用 getVideoDetails 函数并返回数据
    const videoDetails = await getVideoDetails(bvid);
    return videoDetails;  // 返回结果
  } catch (error) {
    console.error('Error in main process:', error);
    throw new Error('Failed to fetch video details');
  }
});

ipcMain.handle('read-bv', async (event, bvid) => {


  const filePath = path.join(__dirname, '..', '..', 'common', 'bvids.txt');

  return new Promise<string[]>((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
      if (err) {
        reject(err);
      } else {
        // Split by newline, trim each line, and filter out any empty lines
        const lines = data
          .split('\n') // Split the content into lines
          .map(line => line.trim()) // Trim whitespace from each line
          .filter(line => line.length > 0); // Remove empty lines

        resolve(lines); // Resolve with the filtered lines
      }
    });
  });
});


ipcMain.handle('save-bv', async (event, bvid) => {
  const filePath = path.join(__dirname, '..', '..', 'common', 'bvids.txt'); // 设置保存路径

  const tempPath = `${filePath}.tmp`;

  // 保存文件
  fs.writeFile(tempPath, bvid, 'utf8', (err) => {
    if (err) {
      logger.error('Failed to write to temp file:', err);
      return;
    }

    fs.rename(tempPath, filePath, (err) => {
      if (err) {
        logger.error('Failed to replace the original file:', err);
      } else {
        logger.info(typeof filePath);

        logger.info(filePath);
      }
    });
  });
});


ipcMain.handle('read-list-json', async (event, folderPath) => {
  try {
    // 确定目标文件夹路径
    const baseSaveDir = path.join(os.homedir(), 'Music', 'bilibiliSearch', folderPath);
    
    // 检查文件夹是否存在
    if (!fs.existsSync(baseSaveDir)) {
      throw new Error('Folder does not exist.');
    }

    // 获取文件夹中的所有文件
    const files = fs.readdirSync(baseSaveDir);

    // 筛选出 .json 文件
    const jsonFiles = files.filter(file => path.extname(file) === '.json');

    if (jsonFiles.length === 0) {
      throw new Error('No JSON files found.');
    }

    // 遍历 JSON 文件，直到找到一个有效的 bvid
    for (let i = 0; i < jsonFiles.length; i++) {
      const jsonFile = jsonFiles[i];
      const filePath = path.join(baseSaveDir, jsonFile);

      // 读取文件内容
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);

      // 获取所有 bvid
      const bvids = jsonData.data.result.map((item: { bvid: any; }) => item.bvid);

      // 查找第一个未被占用的 bvid
      for (let bvid of bvids) {
        if (!getSubdirectoriesOfSubdirectories('C:\\Users\\r\\Music\\bilibiliSearch').includes(bvid)) {
          // Do something when the bvid is not found in the subdirectories
          if(!getImmediateSubdirectories('C:\\Users\\r\\Music\\bilibiliURL').includes(bvid))
          {
            return bvid; }// 返回第一个不存在的 bvid

        
        }
        
      }
    }

    // 如果所有 JSON 文件都没有可用的 bvid
    return null;

  } catch (error) {
    console.error('Error reading JSON files:', error);
    return { error: error}; // 返回错误信息
  }
});

function getImmediateSubdirectories(folderPath: string): string[] {
  let allDirectories: string[] = [];
  
  // Get all files and directories inside the current folder
  const files = fs.readdirSync(folderPath);

  // Iterate over the items in the folder
  for (let file of files) {
    const fullPath = path.join(folderPath, file);
    // If it's a directory, add only the directory name (not the full path) to the list
    if (fs.statSync(fullPath).isDirectory()) {
      allDirectories.push(file); // Push the directory name, not the full path
    }
  }

  // Return all found immediate directories (only the names)
  return allDirectories;
}


function getSubdirectoriesOfSubdirectories(folderPath: string): string[] {
  let allDirectories: string[] = [];
  
  // Get all files and directories inside the current folder
  const files = fs.readdirSync(folderPath);

  // Iterate over the items in the folder
  for (let file of files) {
    const fullPath = path.join(folderPath, file);
    // If it's a directory, we check for subdirectories inside it (second level)
    if (fs.statSync(fullPath).isDirectory()) {
      // Get subdirectories inside this directory
      const subFiles = fs.readdirSync(fullPath);
      
      for (let subFile of subFiles) {
        const subDirPath = path.join(fullPath, subFile);
        if (fs.statSync(subDirPath).isDirectory()) {
          // Add only the subdirectory name (not the full path)
          allDirectories.push(subFile); 
        }
      }
    }
  }

  // Return all found subdirectory names (not full paths)
  return allDirectories;
}

// Main process handler for getting directories


};

