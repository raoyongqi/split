import { getAxiosInstance } from '../main/network';


async function getSelfInfo() {
  try {
    const axios = await getAxiosInstance(); // 获取 Axios 实例
    const response = await axios('https://api.bilibili.com/x/space/myinfo'); // 发起请求
    return response.data; // 返回响应数据
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error; // 向调用方抛出错误
  }
}





export  default getSelfInfo ;
