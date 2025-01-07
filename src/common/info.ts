import { getAxiosInstance } from '../main/network';
import axios from 'axios';
import { URLSearchParams } from 'url';

import configService from '../main/config-service';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {getWbiKeys,encWbi} from './wbi';
import { useLogger } from '../common/logger';

import {downloadM4sPlay, downloadPlayUrlJson,downloadPlayUrlM4s,downloadPlayUrlSearch,saveVideoDetails, saveVideoDetailsPlay } from '../common/download';


import {mergeM4sToM4a} from '../main/service/ff';


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

export async function getSearchVideo(keyword: string, page: number,  ): Promise<any> {
  const saveDir = path.join(os.homedir(), 'Music', 'bilibiliSearch', keyword);

  const files = fs.readdirSync(saveDir);
  
  // 筛选出 .json 文件并去除扩展名
  const jsonFiles = files
    .filter(file => path.extname(file) === '.json')
    .map(file => path.basename(file, '.json')); // 去掉扩展名
  
  // 提取文件名中的数字部分，并按数字排序
  const sortedFiles = jsonFiles
    .map(file => {
      const match = file.match(/_(\d+)$/); // 匹配最后一个下划线后的数字部分
      return match ? { file, number: parseInt(match[1], 10) } : null;
    })
    .filter(item => item !== null) // 过滤掉没有数字部分的文件
    .sort((a, b) => b.number - a.number); // 按数字降序排序
  
  // 获取最大数字部分对应的文件名
  const largestFile = sortedFiles[0];

  const largepage = largestFile ? largestFile.number+1 : 1
  
  
  page = (page < largepage) ? largepage : page;

  const query = await getQuery({ keyword,page, search_type: 'video' });

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
    // 获取返回的数据
    const responseData = response.data;

    // 保存数据到 JSON 文件
    const saveFilePath = path.join(saveDir, `${keyword}_${page}.json`);
    fs.writeFileSync(saveFilePath, JSON.stringify(responseData, null, 2), 'utf8');
    
    // 返回整个响应数据
    return responseData;
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

        const qnfnval = `${qn}_${fnval}`
        

        await downloadPlayUrlJson(result,bvid,cid,qnfnval)
        
        await downloadPlayUrlM4s(result,bvid,cid,qnfnval)


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

// 这个不那么大

// BV1js411t7mq

// 单p视频1
// BV1Aq4y1o7p2



export async function getVideoPlayUrl(bvid: string): Promise<any> {
  // 定义 `playurl` 接口 URL
  const urlGetPlayUrl = `https://api.bilibili.com/x/player/wbi/playurl`; // 使用新的 URL

  // 获取 Cookie 字符串（包括 SESSDATA 和 buvid3）
  const cookieString = await configService.fns.get('cookieString'); // 获取存储的 cookie 字符串
  
  // 如果 cookieString 未定义，可以在这里加个验证或提示
  if (!cookieString) {
    throw new Error('Cookie (SESSDATA and buvid3) not found!');
  }

  // 定义请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',  // 注意：不含敏感子串
    'Cookie': `${cookieString}`,  // 替换为你的 SESSDATA 和 buvid3 值
    'referer': 'https://message.bilibili.com/', // 参考来源页面，确保请求来源正确
  };

  // 定义请求参数
  const params = {
    bvid,       // 视频的 bvid
  };

  try {
    // 发送 GET 请求
    const response = await axios.get(urlGetPlayUrl, { headers, params });

    // 返回响应数据
    return response.data;
  
  } catch (error) {
    
    console.error('Error fetching video play URL:', error);
    
    throw error; // 重新抛出错误以便调用方处理
  }
}

// 单个BV获取


export async function getPlayUrlSig(bvid: string, qn: number = 16, fnval: number = 16) {
  const cookieString = await configService.fns.get('cookieString');
  const baseUrl = 'https://api.bilibili.com/x/player/playurl';

  // 设置自定义请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie': cookieString, // 传入 cookie 字符串
    referer: 'https://message.bilibili.com/',
  };

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

  const saveDir = path.join(os.homedir(), 'Music', 'bilibiliURL', bvid);

  // 判断路径是否存在，如果存在抛出错误
  if (fs.existsSync(saveDir)) {
    throw new Error(`目录 ${saveDir} 已存在，避免重复下载。`);
  }

  try {
    // 获取视频详情
    const videoDetails = await getVideoDetails(bvid);
    
    // 调用保存视频详情的函数
    await saveVideoDetails(bvid, videoDetails);

    if (videoDetails.pages.length === 1) {
      
      const cid = videoDetails.pages[0].cid;
      
      logger.info(`这是单p视频`);

      const result = await getCidUrl(cid);
      const qnfnval = `${qn}_${fnval}`;
      
      await downloadPlayUrlJson(result, bvid, cid, qnfnval);
      
      await downloadPlayUrlM4s(result, bvid, cid, qnfnval);

      return result; // 返回单P视频的结果

    } else {
      
      logger.info(`这是多p视频${videoDetails.pages.length}`);

      const multiPageResults = [];

      // 遍历所有页面
      for (const item of videoDetails.pages) {
        try {
          const cid = item.cid;
          const qnfnval = `${qn}_${fnval}`;

          // 获取播放 URL
          const result = await getCidUrl(cid);

          // 执行下载操作
          await downloadPlayUrlJson(result, bvid, cid, qnfnval);
          
          await downloadPlayUrlM4s(result, bvid, cid, qnfnval);

          logger.info(`Successfully downloaded play URLs for CID ${cid}`);

          multiPageResults.push(result); // 将每个页面的结果保存到数组中

        } catch (error) {
          console.error(`Error processing CID ${item.cid}:`, error);
        }
      }

      // 返回所有页面的结果
      return multiPageResults;
    }
  } catch (error) {
    console.error('Error fetching play URLs:', error);
    throw error;
  }
}


export async function getVideoDetails(bvid: string) {
  try {
    // 获取 cookieString
    const cookieString = await configService.fns.get('cookieString');

    // 定义请求头
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',  // 注意：不含敏感子串
      'Cookie': `${cookieString}`,  // 替换为你的 SESSDATA 和 buvid3 值
      'referer': 'https://message.bilibili.com/',
    };

    // Bilibili 视频详情接口
    const url = `https://api.bilibili.com/x/web-interface/view`;

    // 发送 GET 请求
    const response = await axios.get(url, {
      params: {
        bvid: bvid // 传递 bvid 参数
      },
      headers: headers, // 使用自定义请求头
    });
    
    // 检查返回的数据
    if (response.data && response.data.code === 0) {
      // 如果请求成功，返回视频数据
      
      return response.data.data;
    
    } else {
      // 如果返回的 code 不是 0，则表示请求失败
      console.error('Failed to fetch video details:', response.data.message);
      throw new Error(response.data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error; // 抛出错误以供调用方处理
  }
}


export async function getPlayUrlSearch(search: string,bvid: string, qn: number = 16, fnval: number = 16) {
  const saveDir = path.join(os.homedir(), 'Music', 'bilibiliSearch', search, bvid);



  // 考公视频包含多个p

  //可能每次下载不完整，如果下载不完整尝试从上次下载的地方开始下载


  if (fs.existsSync(saveDir)) {
    // 如果目录存在，检查是否包含 JSON 文件
    const files = fs.readdirSync(saveDir);
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
  
    if (jsonFiles.length > 0) {
      console.log(`目录 ${saveDir} 中包含以下 JSON 文件:`);
      console.log(jsonFiles);


      
    } else {
      console.log(`目录 ${saveDir} 不包含 JSON 文件.`);
    }
  
    throw new Error(`目录 ${saveDir} 已存在，避免重复下载。`);
  }

  // 检查文件夹是否存在，如果不存在则创建
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
    console.log('文件夹已创建：', saveDir);
  } else {
    console.log('文件夹已存在：', saveDir);
  }
  



  const cookieString = await configService.fns.get('cookieString');
  const baseUrl = 'https://api.bilibili.com/x/player/playurl';

  // 设置自定义请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0',
    'Cookie': cookieString, // 传入 cookie 字符串
    referer: 'https://message.bilibili.com/',
  };

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

  try {
    // 获取视频详情
    const videoDetails = await getVideoDetails(bvid);
    
    // 调用保存视频详情的函数
    await saveVideoDetailsPlay(search,bvid, videoDetails);

    if (videoDetails.pages.length === 1) {



      
      const cid = videoDetails.pages[0].cid;
      

      const result = await getCidUrl(cid);
      const qnfnval = `${qn}_${fnval}`;
      
      // 执行下载操作
      const downloadDir = path.join(os.homedir(), 'Music', 'bilibiliSearch',`${search}`,`${bvid}`, `${bvid}_${qnfnval}`); // 根据实际路径修改

      if (fs.existsSync(downloadDir)) {

        console.log(`目录 ${downloadDir} 已存在，跳过下载步骤。`);

      } else {
        // 如果目录不存在，执行下载步骤

        console.log(`目录 ${downloadDir} 不存在，开始下载...`);

        await downloadPlayUrlSearch(result, search, bvid, cid, qnfnval);
        await downloadM4sPlay(result, search, bvid, cid, qnfnval);

      }
      return result; // 返回单P视频的结果

    } else {
      

      const multiPageResults = [];

      // 遍历所有页面
      for (const item of videoDetails.pages) {

        try {
        
        
          const cid = item.cid;
          const qnfnval = `${qn}_${fnval}`;

          // 获取播放 URL
          const result = await getCidUrl(cid);

          // 执行下载操作
          const downloadDir = path.join(os.homedir(), 'Music', 'bilibiliSearch',`${search}`,`${bvid}`, `${bvid}_${qnfnval}`); // 根据实际路径修改

            if (fs.existsSync(downloadDir)) {

              console.log(`目录 ${downloadDir} 已存在，跳过下载步骤。`);

            } else {
              // 如果目录不存在，执行下载步骤

              console.log(`目录 ${downloadDir} 不存在，开始下载...`);

              await downloadPlayUrlSearch(result, search, bvid, cid, qnfnval);
              await downloadM4sPlay(result, search, bvid, cid, qnfnval);

            }

          multiPageResults.push(result); // 将每个页面的结果保存到数组中

        } catch (error) {
          console.error(`Error processing CID ${item.cid}:`, error);
        }
      }

      // 返回所有页面的结果
      return multiPageResults;
    }
  } catch (error) {
    console.error('Error fetching play URLs:', error);
    throw error;
  }
}



