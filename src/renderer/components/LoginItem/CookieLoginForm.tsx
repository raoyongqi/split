import React from 'react';
import { Form, Input, Button } from 'antd';

interface CookieLoginFormProps {
}

const CookieLoginForm: React.FC<CookieLoginFormProps> = ({ }) => {
  return (
    <Form layout="vertical">
      <Form.Item
        name="cookie"
        label="Cookie"
        rules={[{ required: true, message: '请输入 Cookie。' }]}
      >
        <Input.TextArea placeholder="请输入 Cookie" rows={6} />
      </Form.Item>
      <Button type="primary" htmlType="submit" block>
        登录
      </Button>
    </Form>
  );
};

export default CookieLoginForm;
