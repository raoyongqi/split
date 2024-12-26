import React, { useState } from 'react';
import { Button } from '@mui/material';
import { message } from 'antd'; // 从 Ant Design 导入 message

const Search: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // 搜索视频的方法
  const handleSearch = async (keyword: string, page: number) => {
    if (!keyword) {
      message.error('请输入搜索关键字');
      return;
    }

    setLoading(true);

    try {
      const data = await window.electronAPI.getSearchVideo(keyword, page); // 确保函数名正确

      // 在数据抓取完成后，保存数据
      await saveData(data, keyword, page);
      console.log(data)
      message.success(`视频搜索完成，第 ${page} 页`);
    } catch (err) {
      message.error('获取视频数据失败');
    } finally {
      setLoading(false);
    }
  };
  // 获取AI摘要 https://api.bilibili.com/x/web-interface/view/conclusion/get

  // 获取音频 https://api.bilibili.com/x/player/wbi/playurl 
  // 
  // 
  // 'child_process'
  // 保存数据到本地的方法
  const saveData = async (data: any, keyword: string, page: number) => {
    try {
      const pageString = `${keyword}_${page}`; // 修正字符串模板拼接

      const result = await window.electronAPI.saveSearchResult(data, keyword, pageString);
      if (result.success) {
        message.success(`数据已保存到: ${result.path}`);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      message.error(`保存数据失败: ${err.message}`);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleSearch('短发', 1)} // 添加测试的参数，确保函数可以被调用
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        {loading ? '加载中...' : '搜索视频'}
      </Button>
    </div>
  );
};

export default Search;
