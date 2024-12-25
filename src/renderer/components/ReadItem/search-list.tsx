import { Box, Button, Typography } from "@mui/material";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { removeSearch } from "../store/search-slice";

const SearchList: React.FC = () => {
  const { search } = useSelector((state: RootState) => state.search);
  const dispatch = useDispatch<AppDispatch>();

// 需要解决风控问题

// 保存前需要校验数据的完整性

// 暂停按钮出问题了

  const [loading, setLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false); // Cancellation state
  const isCancelledRef = useRef(false); // Ref to track the cancellation state
  const [error, setError] = useState<string | null>(null);
  // 保存已完成的逻辑
  
  useEffect(() => {
    // 如果 songs 不为空，才执行保存操作
    if (search.length > 0) {
      const saveSearch = async () => {
        try {
          const updatedSearch = search.join("\n");
          await window.electronAPI.saveSearch(updatedSearch); // 使用 await 等待保存操作完成
        } catch (error) {
          console.error("Error saving songs:", error);
        }
      };
  
      saveSearch(); // 调用保存操作
    }
  }, [search]); // 依赖于 songs 更新
  
  // Whenever `isCancelled` changes, update the `isCancelledRef`
  useEffect(() => {
    isCancelledRef.current = isCancelled;
  }, [isCancelled]);

  // Handle search for a specific keyword and page
  const handleSearch = async (keyword: string, page: number) => {

    try {
      const data = await window.electronAPI.getSearchVideo(keyword, page);
      await saveData(data, keyword, page);
      message.success(`视频搜索完成，第 ${page} 页`);
    } catch (err) {
      message.error('获取视频数据失败');
    }
  };

  // Save data to local
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

  // DeepBulkSearch: Process each search result one by one
  const deepBulkSearch = async () => {
    if (!search.length) {
      message.error('没有搜索结果');
      return;
    }

    setLoading(true); // Set loading state when the search begins
    try {
      // Process each search result
      for (let i = 0; i < search.length; i++) {
        // Check if the operation is cancelled
        if (isCancelledRef.current) {
          message.info('操作已取消');
          break;
        }

        const result = search[i];
        if (!result) {
          message.error(`没有找到关键词: 第 ${i + 1} 条`);
          dispatch(removeSearch({ id: result }));
          continue;
        }
        
        for (let page = 1; page <= 100; page++) {
          await handleSearch(result, page); // Assuming only one page is handled per result
        
        }
  
        // Start searching for the specific result
       

        // Remove processed search from the state
        dispatch(removeSearch({ id: result }));
      }

      message.success('所有数据已成功保存并删除');
    } catch (err) {
      setError('批量搜索失败');
      message.error('批量搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // Toggle the cancel button
  const handleCancel = () => {
    setIsCancelled((prev) => !prev);
  };

  return (
    <Box>
      <Typography variant="h6">
        Search Length: {search.length}
      </Typography>

      {/* Trigger deep bulk search */}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={deepBulkSearch} 
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        Deep Bulk Search (逐条处理)
      </Button>

      {/* Cancel button to stop the operation */}
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleCancel} 
        disabled={loading} 
        style={{ marginTop: 20, marginLeft: 10 }}
      >
        {isCancelled ? '已取消' : '取消操作'}
      </Button>

      {/* Display error message */}
      {error && <Typography color="error" variant="body2" style={{ marginTop: 20 }}>{error}</Typography>}
    </Box>
  );
};

export default SearchList;
