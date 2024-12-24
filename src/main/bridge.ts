import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { getAxiosInstance, cookieJar } from './network';
import GeetestCaptcha from './GeetestCaptcha';
import configService from './config-service';

import { useLogger } from '../common/logger';

import { TestProxy } from './test-proxy';
const { logger } = useLogger('silly');

export function initBridge() {

  ipcMain.handle('captcha', async () => {
    return await getCaptchaSettings();
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

};

const  loginWithSmsCodesendSms = async (
  cid: string,
  phoneNumber: string,
  code: string,
  captchaKey: string
)=>  {
  const axios = await getAxiosInstance();
  const resp: any = (
    await axios.post(
      'https://passport.bilibili.com/x/passport-login/web/login/sms',
      new URLSearchParams({
        cid,
        tel: phoneNumber,
        code,
        source: 'main_mini',
        keep: '0',
        captcha_key: captchaKey,
        go_url: 'https://www.bilibili.com/',
      }).toString()
    )
  ).data;

  if (resp.code === 0) {
    // 登录成功，更新配置
    configService.fns.set(
      'cookieString',
      await cookieJar.getCookieString('https://www.bilibili.com/')
    );
  }

  return resp;
}



const sendSms = async (cid: string, phoneNumber: string, captcha: GeetestCaptcha) => {
  const axiosInstance = await getAxiosInstance();  // 假设 getAxiosInstance() 返回 axios 实例
  try {
    const response = await axiosInstance.post(
      'https://passport.bilibili.com/x/passport-login/web/sms/send',
      new URLSearchParams({
        cid,
        tel: phoneNumber,
        source: 'main_mini',
        ...captcha,
      }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to send SMS');
  }
};


async function getCaptchaSettings(): Promise<any> {
  const response = await axios.get('https://passport.bilibili.com/x/passport-login/captcha?source=main_web');
  return response.data;
}