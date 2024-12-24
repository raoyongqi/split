import { ipcMain } from 'electron';

import axios from 'axios';


import {loginWithPassword,loginWithSmsCodesendSms} from '../common/login';

import sendSms from '../common/send';

import { useLogger } from '../common/logger';

import { TestProxy } from './test-proxy';


const { logger } = useLogger('silly');

export function initBridge() {

  ipcMain.handle('captcha', async () => {
    const response = await axios.get('https://passport.bilibili.com/x/passport-login/captcha?source=main_web');
    return response.data;
  });

  ipcMain.handle('key', async () => {
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
    return await loginWithSmsCodesendSms(cid,phoneNumber,code,captchaKey);
  });


  ipcMain.handle('test_proxy', async () => {
    return await TestProxy();
  });

  
  ipcMain.handle('login_password', async (event, username: string, password: string, captcha: any) => {
      return await loginWithPassword(username, password, captcha); // 将结果返回给渲染进程

  });
};






