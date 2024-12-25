import React from 'react';
import { Input, Button, Form, message, Select } from "antd";
import { useBoolean } from 'ahooks';  // 假设你在使用 ahooks 库来管理状态

interface CookieLoginFormProps {
}

const CookieLoginForm: React.FC<CookieLoginFormProps> = ({ }) => {

  const [isCookieLoginButtonDisabled, { set: setIsCookieLoginButtonDisabled }] =
    useBoolean(false);

  const loginWithCookie = async (values: any) => {
    const cookieString = values.cookie;

    setIsCookieLoginButtonDisabled(true);
    const result = await window.electronAPI.login_cookies(cookieString);

    if (result) {
      message.success("success")

    } else {
      message.error("success")

    }
    setIsCookieLoginButtonDisabled(false);
  };

  return (
<Form onFinish={loginWithCookie}>
                <Form.Item
                  name="cookie"
                  label="Cookie"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      message: '请输入 Cookie。',
                    },
                  ]}
                >
                  <Input.TextArea
                    style={{
                      resize: 'none',
                    }}
                    rows={6}
                    autoSize={false}
                  />
                </Form.Item>
                <Button
                  disabled={isCookieLoginButtonDisabled}
                  htmlType="submit"
                  type="primary"
                  block
                >
                  登录
                </Button>
              </Form>
  );
};

export default CookieLoginForm;
