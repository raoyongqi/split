import { ipcMain } from 'electron';

import axios from 'axios';

import configService from '../main/config-service';
import {loginWithPassword,loginWithSmsCode,loginWithCookie} from '../common/login';

import sendSms from '../common/send';

import { useLogger } from '../common/logger';

import { TestProxy } from './test-proxy';

import fs from 'fs';
import path from 'path';
import { dialog } from 'electron';
const { logger } = useLogger('silly');

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
};


// 在主进程中封装获取cookieString的函数
async function getCookieString() {
  try {
    const cookieString = await configService.fns.get('cookieString');
    console.log('Latest cookieString:', cookieString);
    return cookieString; // 返回cookie字符串
  } catch (error) {
    console.error('Failed to get cookieString:', error);
    throw error; // 将错误抛出
  }
}


// 获取 cookieString 并保存到文件
async function downloadCookie() {
  try {
    // 获取最新的 cookieString
    const cookieString = await configService.fns.get('cookieString');
    console.log('Latest cookieString:', cookieString);

    // 打开文件保存对话框，允许用户选择保存位置
    const result = await dialog.showSaveDialog({
      title: 'Save Cookie File',
      defaultPath: path.join(__dirname, 'cookie.txt'),
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (result.canceled) {
      console.log('User canceled the save operation');
      return;
    }

    const filePath = result.filePath;
    // 保存 cookieString 到选定的文件路径
    fs.writeFileSync(filePath, cookieString, 'utf8');
    console.log('Cookie saved to:', filePath);

    return filePath; // 返回文件路径
  } catch (error) {
    console.error('Failed to download cookie file:', error);
    throw error; // 抛出错误
  }
}
