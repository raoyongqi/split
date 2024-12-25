import React, { useState } from 'react';
import { Button, message, Form, Input } from 'antd';

const Search: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  // 搜索视频的方法
  const handleSearch = async (values: { keyword: string; page: number }) => {
    const { keyword, page } = values;

    if (!keyword) {
      message.error('请输入搜索关键字');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await window.electronAPI.getSearchVideo(keyword, page);

      // 在数据抓取完成后，直接保存数据
      await saveData(data, keyword, page); 

      message.success('视频搜索完成');
    } catch (err) {
      setError('获取视频数据失败');
      message.error('获取视频数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存数据到本地的方法
  const saveData = async (data: any, keyword: string, page: number) => {
    try {
      // 通过 Electron API 保存数据，并传递文件名、页面信息
      const pageString =`${keyword}_ ${page}`; 

      const result = await window.electronAPI.saveSearchResult(data, keyword, pageString );
      if (result.success) {
        message.success(`数据已保存到: ${result.path}`);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      message.error(`保存数据失败: ${err.message}`);
    }
  };

  return (
    <div>
      <Form
        form={form}
        layout="inline"
        onFinish={(values) => handleSearch(values)}
        initialValues={{ page: 1 }}
      >
        <Form.Item
          name="keyword"
          rules={[{ required: true, message: '请输入搜索关键字' }]}
        >
          <Input placeholder="输入搜索关键词" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item
          name="page"
          rules={[{ required: true, message: '请输入页面编号' }]}
        >
          <Input
            type="number"
            min={1}
            placeholder="输入页码"
            style={{ width: 100 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            搜索
          </Button>
        </Form.Item>
      </Form>

      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}
    </div>
  );
};

export default Search;
