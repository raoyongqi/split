import React from 'react';
import { Form, Input, Button } from 'antd';

interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = ({  }) => {
  return (
    <Form layout="vertical">
      <Form.Item
        label="账户"
        name="loginUsername"
        rules={[{ required: true, message: "请输入账户" }]}
      >
        <Input placeholder="请输入账户" />
      </Form.Item>
      <Form.Item
        label="密码"
        name="loginPassword"
        rules={[{ required: true, message: "请输入密码" }]}
      >
        <Input.Password placeholder="请输入密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
