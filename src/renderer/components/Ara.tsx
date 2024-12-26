import React, { useState } from 'react';

const Ara: React.FC = () => {
  const [uri, setUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const addUriToAria2 = async () => {
    if (!uri) {
      setError('URI 不能为空');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);  // 清空之前的错误信息

      // 调用通过 preload 暴露的 API
      const res = await window.electronAPI.addUriToAria2(uri);

      // 更新结果
      setResult(res);
    } catch (err: any) {
      setError(err.message || '发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Aria2 Add URI</h1>

      {/* 显示加载状态 */}
      {isLoading && <p>正在添加 URI...</p>}

      {/* 显示错误信息 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 显示成功结果 */}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}

      {/* 用户输入 URI 并点击添加 */}
      <input
        type="text"
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        placeholder="请输入 URI"
      />
      <button onClick={addUriToAria2} disabled={isLoading}>
        添加 URI 到 Aria2
      </button>
    </div>
  );
};

export default Ara;
