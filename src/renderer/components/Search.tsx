import React, { useState } from 'react';
import { Button, Input, message, Spin } from 'antd';

const Cid: React.FC = () => {
  const [bvid, setBvid] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle the button click to fetch CID
  const handleFetchCid = async (bvid: string) => {
    if (!bvid) {
      message.error('Please enter a valid bvid');
      return;
    }

    setLoading(true);
    try {

      const response = await window.electronAPI.getCidByBvid(bvid);
      const fetchedCid = response.data; // 假设返回的第一个结果包含 CID


      console.log(fetchedCid); // 在控制台打印 CID
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

      {/* 传递测试的参数 'BV1Aq4y1o7p2' */}
      <Button
        type="primary"
        onClick={() => handleFetchCid('BV1Aq4y1o7p2')}
        loading={loading}
        style={{ marginBottom: 20 }}
      >
        Fetch CID
      </Button>

    </div>
  );
};

export default Cid;
