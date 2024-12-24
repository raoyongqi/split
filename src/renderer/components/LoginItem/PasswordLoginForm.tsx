import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useBoolean } from 'ahooks';  // 假设你在使用 ahooks 库来管理状态

interface LoginFormProps {
  getCaptchaResult: () => Promise<any>;
}

const LoginForm: React.FC<LoginFormProps> = ({getCaptchaResult}) => {
  // 管理按钮禁用状态
  const [loginButtonDisabled, { set: setLoginButtonDisabled }] = useBoolean(false);

  // 表单提交函数

  //缺少盐
  const loginWithPassword = async (values: any) => {
    setLoginButtonDisabled(true);

    try {
      const result = await getCaptchaResult();

      if (result === null) {
        setLoginButtonDisabled(false);
        return;
      }

      const resp: any = await window.electronAPI.login_password(
        values.username,
        values.password,
        {
          challenge: result.geetest_challenge,
          seccode: result.geetest_seccode,
          validate: result.geetest_validate,
          token: result.token,
        }
      );

      if (resp.code !== 0) {
        
      } else {


      }
    } catch (err: any) {
      console.error(err);

    } finally {
      setLoginButtonDisabled(false);
    }
  };

  // 模拟的 API 请求函数
  const mockLoginApi = async (username: string, password: string) => {
    // 这里只是一个模拟的 API 请求，实际应该根据你的需求去请求后端
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === '1234') {
          resolve({ success: true });
        } else {
          resolve({ success: false, message: '账号或密码错误' });
        }
      }, 1000);
    });
  };

  return (
    <Form requiredMark={false} onFinish={loginWithPassword}>
      <Form.Item
        label="账号"
        name="username"
        rules={[
          {
            type: 'string',
            required: true,
            message: '请输入账号。',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="密码"
        name="password"
        rules={[
          {
            type: 'string',
            required: true,
            message: '请输入密码。',
          },
        ]}
      >
        <Input type="password" />
      </Form.Item>

      <Button
        disabled={loginButtonDisabled}
        block
        type="primary"
        htmlType="submit"
      >
        登录
      </Button>
    </Form>
  );
};

export default LoginForm;
