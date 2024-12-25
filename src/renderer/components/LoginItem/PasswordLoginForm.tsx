import React, { useRef } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useBoolean } from 'ahooks';  // 假设你在使用 ahooks 库来管理状态

interface LoginFormProps {
  getCaptchaResult: () => Promise<any>;
}

const LoginForm: React.FC<LoginFormProps> = ({ getCaptchaResult }) => {
  // 管理按钮禁用状态
  const [loginButtonDisabled, { set: setLoginButtonDisabled }] = useBoolean(false);

  // 使用 useRef 来存储表单字段的最新值
  const usernameRef = useRef<string | undefined>(undefined);
  const passwordRef = useRef<string | undefined>(undefined);

  // 使用 useRef 来存储 captcha result 的最新值
  const resultRef = useRef<any>(null);

  // 表单提交函数
  const loginWithPassword = async (values: any) => {
    setLoginButtonDisabled(true);

    // 获取最新的表单字段值
    usernameRef.current = values.username;
    passwordRef.current = values.password;

    // 检查输入是否为空
    if (!usernameRef.current || !passwordRef.current) {
      message.error('用户名和密码不能为空');
      setLoginButtonDisabled(false);
      return; // Early return if validation fails
    }

    try {
      const result = await getCaptchaResult();

      // 使用 useRef 存储最新的 result
      resultRef.current = result;

      if (resultRef.current === null) {
        setLoginButtonDisabled(false);
        return;
      }

      // 确保验证码信息完整
      if (!resultRef.current.geetest_challenge) {
        message.error('验证码的 challenge 信息不完整');
        setLoginButtonDisabled(false);
        return;
      } else if (!resultRef.current.geetest_seccode) {
        message.error('验证码的 seccode 信息不完整');
        setLoginButtonDisabled(false);
        return;
      } else if (!resultRef.current.geetest_validate) {
        message.error('验证码的 validate 信息不完整');
        setLoginButtonDisabled(false);
        return;
      } else if (!resultRef.current.token) {
        message.error('验证码的 token 信息不完整');
        setLoginButtonDisabled(false);
        return;
      }

      // 使用最新的用户名、密码和验证码结果，发起登录请求
      const resp: any = await window.electronAPI.login_password(
        usernameRef.current,
        passwordRef.current,
        {
          challenge: resultRef.current.geetest_challenge,
          seccode: resultRef.current.geetest_seccode,
          validate: resultRef.current.geetest_validate,
          token: resultRef.current.token,
        }
      );

      if (resp.code !== 0) {
        
        message.error(`错误信息: ${resp.message}`);
      } else if (resp.data.status === 2) {
        // 如果 status 是 2，表示需要手机号验证或绑定
        message.error(`错误码: ${resp.code}`);
        message.error(`错误信息: ${resp.message}`);

        window.open(resp.data.url, '_blank');
      
    } else {
        message.success("登录成功");
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoginButtonDisabled(false);
    }
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
        <Input.Password type="password" />
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
