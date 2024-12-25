import React, { useState } from 'react';
import { Button } from '@mui/material';
import { message } from 'antd'; // 从 Ant Design 导入 message

const Search: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 搜索视频的方法
  const handleSearch = async (keyword: string, page: number) => {
    if (!keyword) {
      message.error('请输入搜索关键字');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await window.electronAPI.getSearchVideo(keyword, page);

      // 在数据抓取完成后，直接保存数据
      await saveData(data, keyword, page); 

      message.success(`视频搜索完成，第 ${page} 页`);
    } catch (err) {
      setError('获取视频数据失败');
      message.error('获取视频数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存数据到本地的方法
  const saveData = async (data: any, keyword: string, page: number) => {
    try {
      const pageString = `${keyword}_ ${page}`; 

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

  // 循环调用 handleSearch 保存前100页的结果
  const handleBulkSearch = async () => {
    const keyword = 'your_search_keyword'; // 替换为实际的搜索关键字

    if (!keyword) {
      message.error('请输入搜索关键字');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (let page = 1; page <= 100; page++) {
        await handleSearch(keyword, page);
      }

      message.success('所有数据已成功保存');
    } catch (err) {
      setError('获取视频数据失败');
      message.error('批量搜索失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleBulkSearch} 
        disabled={loading} 
        style={{ marginTop: 20 }}
      >
        批量保存前100页
      </Button>

      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}
    </div>
  );
};

export default Search;
