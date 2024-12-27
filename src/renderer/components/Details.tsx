import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

const VideoDetailsComponent: React.FC = () => {
  const [bvid, setBvid] = useState<string>('BV1Aq4y1o7p2'); // 视频的 bvid
  const [loading, setLoading] = useState<boolean>(false); // 加载状态
  const [error, setError] = useState<string>(''); // 错误信息

  // 获取视频详情
  const fetchVideoDetails = async (bvid: string) => {
    try {
      setLoading(true);
      setError('');
      const details = await window.electronAPI.getBVDetails(bvid); // 调用 IPC 接口
      console.log('Video Details:', details); // 只在控制台输出结果
    } catch (err) {
      console.error('Error fetching video details:', err);
      setError('Failed to fetch video details');
    } finally {
      setLoading(false);
    }
  };

  // 点击按钮时触发获取视频详情
  const handleFetchDetails = () => {
    if (bvid) {
      fetchVideoDetails(bvid);
    }
  };

  return (
    <div>
      <h1>Bilibili Video Details</h1>

      {/* 输入框，用于输入 bvid */}
      <input
        type="text"
        placeholder="Enter BVID"
        value={bvid}
        onChange={(e) => setBvid(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', fontSize: '16px' }}
      />

      {/* 按钮，用于触发视频详情请求 */}
      <button onClick={handleFetchDetails} disabled={loading} style={{ marginLeft: '10px' }}>
        {loading ? 'Loading...' : 'Fetch Video Details'}
      </button>

      {/* 显示加载状态 */}
      {loading && <p>Loading video details...</p>}

      {/* 显示错误信息 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VideoDetailsComponent;
