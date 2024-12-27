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


import {getPageInfo,getSearchVideo,getCidByAid,getCidByBvid,getPlayUrl} from '../common/info';

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



ipcMain.handle('save-search-result', async (event, data, keyword: string, pageString: string) => {
  try {
    // 去掉不合法的字符，确保文件名安全
    const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, '');

    // 设置保存目录
    const saveDir = path.join(os.homedir(), 'Music', 'bilibili', safeKeyword);

    // 如果目录不存在，则创建它
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // 设置保存的文件路径
    const savePath = path.join(saveDir, `${pageString}.json`);

    if (fs.existsSync(savePath)) {
      return { success: false, error: '文件已经存在，跳过保存' };
    }
    // 将 data 转换为 JSON 格式
    const jsonData = JSON.stringify(data, null, 2); // 格式化 JSON 数据（增加缩进）

    // 将 JSON 数据保存到文件
    fs.writeFileSync(savePath, jsonData, 'utf-8');

    // 返回保存成功的路径
    return { success: true, path: savePath };
  } catch (error) {
    console.error('保存数据失败:', error);
    return { success: false, error: error };

  }


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
  
  return await getPlayUrl(bvid,qn,fnval);

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


};

