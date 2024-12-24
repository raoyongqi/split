import React, { useState } from 'react';
import { Button, message } from 'antd';

const Switch: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleTestProxy = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.test_proxy();
      console.log(result);  // 输出结果以进行调试

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
      setLoading(false);  // 无论如何都要停止加载状态
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button type="primary" onClick={handleTestProxy} loading={loading}>
        Test Proxy
      </Button>
    </div>
  );
};

export default Switch;
