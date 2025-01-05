import { Box, Button, Typography } from "@mui/material";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { removeBv } from "../store/bv-slice";

const BvList: React.FC = () => {
  const { bv } = useSelector((state: RootState) => state.bv);
  const dispatch = useDispatch<AppDispatch>();

  const [isCancelled, setIsCancelled] = useState(false); // Cancellation state
  const isCancelledRef = useRef(false); // Ref to track the cancellation state
  const [Downloading, setDownloading] = useState(false);

  // BV1pA4m1A7gb 怎样才能种好有机西红柿？这样做西红柿病虫害少结的多不裂果	835	0	0	植物,技巧,种菜,种植,蔬菜,每天一个新知识,哔哩哔哩开学季	13	2:58
// 这个视频获取失败，不知道为啥


//修改获取失败的逻辑

//让log小一点
  useEffect(() => {
    // If bv is not empty, start saving process
    if (bv.length > 0) {
      const saveBv = async () => {
        try {
          const updatedBv = bv.join("\n");
          
          await window.electronAPI.saveBv(updatedBv); // Await the save operation
        } catch (error) {
          console.error("Error saving BV:", error);
        }
      };
      saveBv(); // Call save operation
    }
  }, [bv]);

  // Whenever `isCancelled` changes, update the `isCancelledRef`
  useEffect(() => {
    isCancelledRef.current = isCancelled;
  }, [isCancelled]);

  // Handle bv for a specific keyword and page
  const handleBv = async (bvid: string) => {
    
    try {
      //先采取mock接口调试按钮有没有问题
      await window.electronAPI.getPlayUrl(bvid,16,16);
      message.success(`${bvid} 对应音频搜索完成`);
    } catch (err) {
      message.error('获取视频数据失败');
    }
  
  };

  // Process each bv result one by one
  const deepBulkBv = async () => {
    
    if (isCancelledRef.current ){ return}; // 如果已取消则不执行
    
    setDownloading(true); // 设置按钮点击状态

    if (!bv.length) {
      message.error('没有搜索结果');
      return;
    }


    setIsCancelled(false); // Reset cancellation state

    try {
      // Loop through all bv results
      for (let i = 0; i < bv.length; i++) {
        // Check if the operation is cancelled
        if (isCancelledRef.current) {
          setDownloading(false); // 恢复按钮的可点击状态

          message.info('操作已取消');
          setIsCancelled(false); // Reset cancellation state

          return;
    
        }

        const result = bv[i];
        //打印当前bv号，便于调试
        console.log(result)

        if (!result) {
          message.error(`该行BV号没有: 第 ${i + 1} 条`);
          console.log(`该行BV号没有: 第 ${i + 1} 条`)

          dispatch(removeBv({ id: result }));
          
          continue;
        }


        
        // Start processing the current bv
        try {
          await handleBv(result); // Download or process the video data for this bv

          // Remove processed bv from the state
          dispatch(removeBv({ id: result }));
        } catch (err) {
          message.error(`处理 BV: ${result} 失败`);
        }
      }

      message.success('所有数据已成功保存');
    } catch (err) {
      message.error('批量处理失败');
    } finally {
      setDownloading(false); // 恢复按钮的可点击状态
    }
  };

  // Toggle the cancel button
  const handleCancel = () => {
    setIsCancelled((prev) => !prev); // 每次点击切换状态
  };


  return (
    <Box>
      <Typography variant="h6">
        Bv Length: {bv.length}
      </Typography>

      {/* Trigger deep bulk bv */}
      <Button
        variant="contained"
        color="primary"
        onClick={deepBulkBv}
        disabled={Downloading }
        style={{ marginTop: 20 }}
      >
        Deep Bulk Bv (逐条处理)
      </Button>

      {/* Cancel button to stop the operation */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleCancel}
        disabled={!Downloading }
        style={{ marginTop: 20, marginLeft: 10 }}
      >
        {isCancelled ? '已取消' : '取消操作'}
      </Button>

   
    </Box>
  );
};

export default BvList;
