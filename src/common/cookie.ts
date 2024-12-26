
import configService from '../main/config-service';
import { dialog } from 'electron';
import path from 'path';
import fs from 'fs';

// 在主进程中封装获取cookieString的函数
export async function getCookieString() {
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
export async function downloadCookie() {
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
  