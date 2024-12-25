import React, { useState } from 'react';
import { Button, message } from 'antd';

const Switch: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // 处理代理测试
  const handleTestProxy = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.test_proxy();
      console.log(result); // 输出结果以进行调试

      // 确保 result 是一个对象并包含 success 属性
      if (result && result.proxy) {
        message.success('Proxy tested successfully!');
      } else {
        message.error(`Proxy test failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      // 捕获异步调用的异常
      message.error(`Error: ${err instanceof Error ? err.message : err}`);
    } finally {
      setLoading(false); // 无论如何都要停止加载状态
    }
  };

  // 获取 cookie
  const handleGetCookie = async () => {
    setLoading(true);
    try {
      const cookie = await window.electronAPI.getCookies();
      console.log(cookie); // 输出 cookie 字符串以供调试
      message.success('Cookie fetched successfully!');
    } catch (err) {
      message.error(`Error: ${err instanceof Error ? err.message : err}`);
    } finally {
      setLoading(false);
    }
  };

  // 下载 cookie
  const handleDownloadCookie = async () => {
    setLoading(true);
    try {
      const filePath = await window.electronAPI.downloadCookies();
      console.log(`Cookie saved to: ${filePath}`);
      message.success(`Cookie saved to: ${filePath}`);
    } catch (err) {
      message.error(`Error: ${err instanceof Error ? err.message : err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button type="primary" onClick={handleTestProxy} loading={loading}>
        Test Proxy
      </Button>
      <Button
        style={{ marginLeft: '10px' }}
        type="default"
        onClick={handleGetCookie}
        loading={loading}
      >
        Get Cookie
      </Button>
      <Button
        style={{ marginLeft: '10px' }}
        type="default"
        onClick={handleDownloadCookie}
        loading={loading}
      >
        Download Cookie
      </Button>
    </div>
  );
};

export default Switch;
