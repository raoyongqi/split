import { getAxiosInstance } from '../main/network';
import axios from 'axios';
import { URLSearchParams } from 'url';

import configService from '../main/config-service';

import {getWbiKeys,encWbi} from './wbi';

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

export async function getSearchVideo(keyword: string,page: number,  ): Promise<any> {
  
  // 获取签名后的查询参数
  const query = await getQuery({ keyword,page, search_type: 'video' });

  // 目标接口 URL（可以根据需要切换使用新旧接口）
  const urlGetSearchType = `https://api.bilibili.com/x/web-interface/wbi/search/type?${query}`;

  const cookieString = await configService.fns.get('cookieString');


  // 定义请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',  // 注意：不含敏感子串
    'Cookie': `${cookieString}`,  // 替换为你的 SESSDATA 和 buvid3 值
    'referer': 'https://message.bilibili.com/',
  };

  try {
    // 发送 GET 请求并传递 headers
    const response = await axios.get(urlGetSearchType, { headers });

    // 返回整个响应数据
    return response.data;
  } catch (error) {
    console.error('Error fetching search type info:', error);
    throw error; // 重新抛出错误以便调用方处理
  }
}

// Fetch the play URL from Bilibili API
export async function getPlayUrl(cid: string,bvid: number) {
  const baseUrl = 'https://api.bilibili.com/x/player/playurl';
  const params = {
    cid: cid,
    bvid: bvid,
    qn: 64,
    fnval: 16,
    try_look: 1,
    voice_balance: 1
  };

  // Get the signed query parameters
  const signedQuery = await getQuery(params);

  // Build the final URL
  const finalUrl = `${baseUrl}?${signedQuery}`;

  // Make the API request and return the response data
  const response = await fetch(finalUrl);
  const responseData = await response.json();
  return responseData;
}
