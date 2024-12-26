import React, { useState } from 'react';
import { Button, Input, message, Select, Spin } from 'antd';

const { Option } = Select;

const Play: React.FC = () => {
  const [bvid, setBvid] = useState('BV1Aq4y1o7p2'); // 默认bvid
  const [loading, setLoading] = useState(false);
  const [qn, setQn] = useState(16); // 默认 360P


  const [fnval, setFnval] = useState(16); // 默认 DASH 格式

  // 处理按钮点击以获取 CID
  const handleFetchCid = async () => {
    if (!bvid) {
      message.error('Please enter a valid bvid');
      return;
    }

    setLoading(true);
    try {
      // 调用 Electron IPC 获取 CID
      const response = await window.electronAPI.getPlayUrl(bvid, qn, fnval);
      
      const videoData = response.data; // 假设返回的第一个结果包含 CID


      const qnfnval = `${qn}_${fnval}`;
      await window.electronAPI.downloadPlayUrl(response,bvid,qnfnval);

      
      console.log(videoData); // 在控制台打印 CID
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
          style={{ width: 300, marginBottom: 20 }}
        />
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <Select
          value={qn}
          onChange={(value) => setQn(value)}
          style={{ width: 200, marginRight: 20 }}
          placeholder="Select Quality"
        >
          <Option value={16}>360P 流畅</Option>
          <Option value={32}>480P 清晰</Option>
          <Option value={64}>720P 高清</Option>
          <Option value={74}>720P60 高帧率</Option>
          <Option value={80}>1080P 高清</Option>
        </Select>

        <Select
          value={fnval}
          onChange={(value) => setFnval(value)}
          style={{ width: 200 }}
          placeholder="Select Format"
        >
          <Option value={1}>MP4 格式</Option>
          <Option value={16}>DASH 格式</Option>
        </Select>
      </div>

      <Button
        type="primary"
        onClick={handleFetchCid}
        loading={loading}
      >
        Fetch URL
      </Button>
    </div>
  );
};

export default Play;
