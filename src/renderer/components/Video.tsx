import React, { useState } from "react";
import { Form, Input, Button, Alert, Spin } from "antd";

// 模拟接口
const mockFetchDownloadLink = async (videoId: string) => {
  // 模拟 API 调用延迟
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (videoId === "2") {

        console.log(videoId)
        resolve(`https://example.com/download/${videoId}`);
      } else {
        reject(new Error("无效的视频 ID，请重新输入！"));
      }
    }, 1000); // 模拟 1 秒延迟
  });
};

const Video: React.FC = () => {
  const [videoId, setVideoId] = useState<string>(""); // 存储输入的 Video ID
  const [downloadLink, setDownloadLink] = useState<string | null>(null); // 存储生成的下载链接
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 错误信息
  const [loading, setLoading] = useState<boolean>(false); // 加载状态

  // 表单提交处理
  const handleFormSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);
    setDownloadLink(null);

    try {
    console.log(videoId)
      const link = await mockFetchDownloadLink(videoId);
      setDownloadLink(link);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "500px", margin: "0 auto" }}>
      <h1>视频下载工具</h1>
      {errorMessage && <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: "20px" }} />}
      <Form
        onFinish={handleFormSubmit}
        layout="vertical"
        initialValues={{ videoId: "" }}
      >
        <Form.Item
          label="视频 ID"
          name="videoId"
          rules={[{ required: true, message: "请输入视频 ID！" }]}
        >
          <Input
            placeholder="请输入视频 ID"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? <Spin size="small" /> : "获取下载链接"}
          </Button>
        </Form.Item>
      </Form>
      {downloadLink && (
        <div style={{ marginTop: "20px" }}>
          <h2>下载链接:</h2>
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007BFF", textDecoration: "none", fontWeight: "bold" }}
          >
            {downloadLink}
          </a>
        </div>
      )}
    </div>
  );
};

export default Video;
