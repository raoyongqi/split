import { getAxiosInstance } from '../main/network';
import axios from 'axios';
import { URLSearchParams } from 'url';

import configService from '../main/config-service';

import {getWbiKeys,encWbi} from './wbi';
import { useLogger } from '../common/logger';
const { logger } = useLogger('silly');

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


// Fetch the play URL from Bilibili API using axios


// 一个获取up主全部视频的 https://app.bilibili.com/x/v2/space/archive/cursor?vmid=[这里填写用户的uid（填写的时候记得把外面的方括号去掉）]




// Fetch the JSON response for a given AID from Bilibili API
export async function getCidByAid(aid: number) {


  const baseUrl = 'https://api.bilibili.com/x/player/pagelist';
  
  const params = {
    aid: aid,  // The AID (video ID) you want to query
  };
  const cookieString = await configService.fns.get('cookieString');

  // Custom headers
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie': cookieString,  // Replace with your actual cookie (SESSDATA and buvid3)
    'referer': 'https://message.bilibili.com/',
  };

  try {
    // Make the API request to get the pagelist with headers
    const response = await axios.get(baseUrl, { params, headers });

    // Return the entire JSON response
    return response.data;
  } catch (error) {
    console.error('Error fetching CID:', error);
    throw error;
  }
}


// Fetch the JSON response for a given AID from Bilibili API
export async function getCidByBvid(bvid: string) {
  const baseUrl = 'https://api.bilibili.com/x/player/pagelist';

  const params = {
    bvid: bvid,  // The BVID (video ID) you want to query
  };

  // 获取 cookie 字符串
  const cookieString = await configService.fns.get('cookieString');

  // Custom headers
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie': cookieString,  // Replace with your actual cookie (SESSDATA and buvid3)
    'referer': 'https://message.bilibili.com/',
  };

  try {
    // Make the API request to get the pagelist with headers
    const response = await axios.get(baseUrl, { params, headers });

    // Get the video data from the response
    const videoData = response.data.data;

    // Check if videoData is an array and has content
    if (Array.isArray(videoData) && videoData.length > 0) {
      if (videoData.length === 1 && videoData[0].page === 1) {
        // Single page video, return an array with the CID of that page
        return [videoData[0].cid];
      } else {
        // Multi-page video, return an array with the CID of each page
        return videoData.map((page: any) => page.cid);
      }
    }

    // If video data is not in the expected format
    throw new Error('Invalid video data format');
  } catch (error) {
    console.error('Error fetching CID:', error);
    throw error;
  }
}



// 获取播放链接的函数
export async function getPlayUrl(bvid: string,qn: number = 16, fnval: number = 16,) {


  const baseUrl = 'https://api.bilibili.com/x/player/playurl';
  const cookieString = await configService.fns.get('cookieString');

  // 设置自定义请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie': cookieString, // 传入 cookie 字符串
    referer: 'https://message.bilibili.com/',
  };

  // 构建请求每个 CID 的 URL
  const getCidUrl = async (cid: number) => {
    const params = {
      cid: cid,
      bvid: bvid,
      qn: qn,
      fnval: fnval, // 使用传入的 fnval 或默认值
    };

    // 获取签名后的查询参数
    const signedQuery = await getQuery(params);

    // 构建最终的请求 URL
    const finalUrl = `${baseUrl}?${signedQuery}`;

    // 请求并返回结果
    try {
      const response = await axios.get(finalUrl, { headers });

      return response.data;
    } catch (error) {
      console.error(`Error fetching play URL for CID ${cid}:`, error);
      return null; // 如果请求失败，返回 null
    }
  };

  // 并行请求所有 CID 的播放链接
  try {
    const cidList = await getCidByBvid(bvid);


    // 如果有多个 CID，使用 Promise.all
    const playUrls = await Promise.all(
      
      cidList.map(async (cid) => {

        const result = await getCidUrl(cid);
        
        logger.info(`Play URL result for CID ${cid}:`, result); // 调试用日志
        
        return result;
      
      })
    );


    // 过滤掉失败的请求结果（null）
    
    
    return playUrls.filter(url => url !== null);
  
  
  } catch (error) {
    
    console.error('Error fetching play URLs:', error);

    throw error;
  }
}

// 一个典型的多p视频
//BV1sp411d7ND 植物病理学——南京农业大学 1300:4

// 单p视频1
// BV1Aq4y1o7p2





