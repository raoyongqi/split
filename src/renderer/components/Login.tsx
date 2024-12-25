import React, { useState } from 'react';
import { Button, message, Row, Col, Card, Spin } from 'antd';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [navData, setNavData] = useState(null);

  const getPageInfo = async () => {
    setLoading(true);
    try {
      
      const result = await window.electronAPI.getPageInfo(1);
      
      console.log(result)
      setNavData(result);  // 存储返回的数据
      message.success('Fetched data successfully!');
    } catch (error) {
      message.error(`Failed to fetch data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: '20px' }} title="Bilibili Navigation Data">
      <Row gutter={16}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button type="primary" onClick={getPageInfo} loading={loading}>
            Fetch Bilibili Nav Data
          </Button>
        </Col>
      </Row>
      {loading ? (
        <Row justify="center" style={{ marginTop: '20px' }}>
          <Col>
            <Spin size="large" />
          </Col>
        </Row>
      ) : (
        <Row style={{ marginTop: '20px' }}>
          <Col span={24}>
            <pre>{JSON.stringify(navData, null, 2)}</pre>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default Home;
