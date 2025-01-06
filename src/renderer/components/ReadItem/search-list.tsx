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

  const [Downloading, setDownloading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false); // Cancellation state
  
  
  const isCancelledRef = useRef(false); // Ref to track the cancellation state
  const [error, setError] = useState<string | null>(null);
 
  
  const firstRender = useRef(true); // 用于判断是否首次渲染

  useEffect(() => {
    if (firstRender.current) {
      // 如果是首次渲染，跳过保存操作
      firstRender.current = false;
      return; // 直接返回，不执行下面的保存操作
    }

    // 如果 search 不为空，才执行保存操作
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
  }, [search]); // 依赖于 search 更新

  // Whenever `isCancelled` changes, update the `isCancelledRef`
  useEffect(() => {
    isCancelledRef.current = isCancelled;
  }, [isCancelled]);


  const handleSearch = async (keyword: string, page: number) => {

    try {
      // 使用 mock 接口代替原本的 API 调用
      const bvid = await window.electronAPI.readListJson(keyword);
      if (bvid  === null) {
        
        await window.electronAPI.getSearchVideo(keyword,page);

        const bvid = await window.electronAPI.readListJson(keyword);

        await window.electronAPI.getPlaySearch(keyword,bvid,16,16);
      }
      
      message.success(`视频搜索完成，第 ${page} 页`);
    } catch (err) {
      message.error('获取视频数据失败');
    }
  };
  
  



  // DeepBulkSearch: Process each search result one by one
  const deepBulkSearch = async () => {
  
    if (!search.length) {
      message.error('没有搜索结果');
      return;
    }

    setDownloading(true); // Set loading state when the search begins
   
   
    setIsCancelled(false); // Reset cancellation state

    try {
      // Process each search result
      for (let i = 0; i < search.length; i++) {
        // Check if the operation is cancelled
        if (isCancelledRef.current) {
          setDownloading(false); // 恢复按钮的可点击状态

          message.info('操作已取消2');
          
          setIsCancelled(false); // Reset cancellation state

          return;
        }

        const result = search[i];
        if (!result) {
          message.error(`没有找到关键词: 第 ${i + 1} 条`);
          
          dispatch(removeSearch({ id: result }));
        
          continue;
        
        }
        
        for (let page = 1; page <= 50; page++) {

          if (isCancelledRef.current) {
            setDownloading(false); // 恢复按钮的可点击状态
  
            message.info('操作已取消，关键词保留');
            
            setIsCancelled(false); // Reset cancellation state
  
            return;
          }
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
      setDownloading(false);
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
        disabled={Downloading}
        style={{ marginTop: 20 }}
      >
        Deep Bulk Search (逐条处理)
      </Button>

      {/* Cancel button to stop the operation */}
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleCancel} 
        disabled={!Downloading} 
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
