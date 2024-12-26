import React, { useState } from 'react';
import { Button, Input, message, Spin } from 'antd';
import { ipcRenderer } from 'electron';

const Cid: React.FC = () => {
  const [bvid, setBvid] = useState('BV1Aq4y1o7p2'); // 默认bvid
  const [loading, setLoading] = useState(false);

  // Handle the button click to fetch CID
  const handleFetchCid = async () => {
    if (!bvid) {
      message.error('Please enter a valid bvid');
      return;
    }

    setLoading(true);
    try {
      // 调用 Electron IPC 获取 CID
      const response = await window.electronAPI.getCidByBvid(bvid);
      
      const videoData = response.data // 假设返回的第一个结果包含 CID

      console.log(videoData); // 在控制台打印 CID

      
    
        if (Array.isArray(videoData) && videoData.length > 0) {
          // 判断是否为单P视频
          if (videoData.length === 1 && videoData[0].page === 1) {


            console.log('This is a single-page video');
          
            console.log(videoData[0].cid);

        } else if (videoData.length > 1) {
            console.log('This is a multi-page video');
          } else {
            console.log('This is an unrecognized video format');
          }
        } else {
          console.log('No video data found');
        }
        
      // 如果是单p视频，返回这个
      const firstCid = response.data.cid // 假设返回的第一个结果包含 CID

      console.log(firstCid); // 在控制台打印 CID
      message.success('CID fetched successfully!');
    } catch (error) {
      message.error('Failed to fetch CID');
      console.error('Error fetching CID:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <Input
          value={bvid}
          onChange={(e) => setBvid(e.target.value)}
          placeholder="Enter bvid"
          style={{ width: 200 }}
        />
      </div>
      
      <Button
        type="primary"
        onClick={handleFetchCid}
        loading={loading}
        style={{ marginBottom: 20 }}
      >
        Fetch CID
      </Button>


    </div>
  );
};

export default Cid;
