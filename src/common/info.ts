import { getAxiosInstance } from '../main/network';
import axios from 'axios';
import { URLSearchParams } from 'url';

import configService from '../main/config-service';

import md5 from 'md5';
export async function getSelfInfo() {
  try {
    const axios = await getAxiosInstance(); // 获取 Axios 实例
    const response = await axios('https://api.bilibili.com/x/space/myinfo'); // 发起请求
    return response.data; // 返回响应数据
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error; // 向调用方抛出错误
  }
}


const mixinKeyEncTab = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52
];




// Function to get the mixin key
function getMixinKey(orig: string): string {

    return mixinKeyEncTab.reduce((s, i) => s + orig[i], '')?.slice(0, 32);

  }

// Function to encode the parameters and add the wbi signature
function encWbi(params: Record<string, string | number>, img_key: string, sub_key: string): Record<string, string> {
  const mixin_key = getMixinKey(img_key + sub_key);
  const curr_time = Math.round(Date.now() / 1000);
  params['wts'] = curr_time; // Add wts field

  // Sort the parameters by key
  const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
          result[key] = params[key];
          return result;
      }, {} as Record<string, string | number>);

  // Filter out invalid characters and ensure all values are strings
  Object.keys(sortedParams).forEach((key) => {
      sortedParams[key] = String(sortedParams[key]).replace(/[!'()*]/g, ''); // Convert to string
  });

  const queryString = new URLSearchParams(sortedParams as any).toString(); // Serialize the params
  const wbi_sign = md5(queryString + mixin_key); // Calculate the w_rid using md5
  sortedParams['w_rid'] = wbi_sign;

  // Ensure the return type is Record<string, string>
  return Object.fromEntries(Object.entries(sortedParams).map(([key, value]) => [key, String(value)]));
}

// Function to fetch img_key and sub_key

async function getWbiKeys(): Promise<{ img_key: string; sub_key: string } | null> {
  // 获取 cookieString
  const cookieString = await configService.fns.get('cookieString');

  // 提取 SESSDATA
  const SESSDATA = cookieString.match(/SESSDATA=([^;]+)/)?.[1];

  if (!SESSDATA) {
    console.error('SESSDATA is missing in the cookie string');
    return null; // 返回 null 如果 SESSDATA 未找到
  }

  // 设置请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie': 'SESSDATA=' + SESSDATA,
    'referer': 'https://message.bilibili.com/',
  };

  try {
    // 发送 GET 请求并传递 headers
    const response = await axios.get('https://api.bilibili.com/x/web-interface/nav', { headers });

    const { img_url, sub_url } = response.data.data.wbi_img;

    // 提取 img_key 和 sub_key
    const img_key = img_url.split('/').pop()?.split('.')[0] || '';
    const sub_key = sub_url.split('/').pop()?.split('.')[0] || '';

    // 返回 img_key 和 sub_key
    return { img_key, sub_key };
  } catch (error) {
    console.error('Error fetching WBI keys:', error);
    throw error; // 重新抛出错误以便调用方捕获
  }
}



// Function to get the signed query
async function getQuery(parameters: Record<string, string | number>): Promise<string> {
  const wbiKeys = await getWbiKeys();

  // 类型保护：如果 wbiKeys 为 null，则抛出错误
  if (!wbiKeys) {
    throw new Error("Failed to get WBI keys: SESSDATA may be missing or invalid.");
  }

  const { img_key, sub_key } = wbiKeys; // 现在 TypeScript 知道 wbiKeys 不为 null

  // 使用 img_key 和 sub_key 调用 encWbi 函数
  const signedParams = encWbi(parameters, img_key, sub_key);

  // 返回签名后的查询字符串
  return new URLSearchParams(signedParams as any).toString();
}





// Example of usage with pagination
export async function getPageInfo(page: number): Promise<any> {  // 修改返回类型为 `any` 以便返回 response 数据
  
  // 获取签名后的查询参数
  const query = await getQuery({ mid: 137324885, ps: 30, pn: page });
  
  const urlGetVideo = `https://api.bilibili.com/x/space/wbi/arc/search?${query}`;

  // 从 configService 获取 cookieString
  const cookieString = await configService.fns.get('cookieString');

  // 从 cookieString 中提取 SESSDATA
  const SESSDATA = cookieString.match(/SESSDATA=([^;]+)/)?.[1];

  if (!SESSDATA) {
    console.error('SESSDATA is missing in the cookie string');
    return; // 如果 SESSDATA 无法提取，则停止执行
  }

  // 定义请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie': 'SESSDATA=' + SESSDATA, // 替换为你的 SESSDATA 值
    'referer': 'https://message.bilibili.com/',
  };

  try {
    // 发送 GET 请求并传递 headers
    const response = await axios.get(urlGetVideo, { headers });
    
    // 返回整个响应数据
    return response.data;
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw error; // 重新抛出错误以便调用方处理
  }
}
