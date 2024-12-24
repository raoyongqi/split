import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, Tabs, Form, message, Select, Row } from "antd";
import countryCallingCodes from '../../../common/constants/country-calling-codes';
import {validateFields,showMessage} from '../../service/ValidCheckservice';
import {sendSmsLoginRequest,sendSmsRequest}  from '../../service/SmsService';


interface SmsLoginFormProps {
  getCaptchaResult: () => Promise<any>;
}


const SmsLoginForm: React.FC<SmsLoginFormProps> = ({ getCaptchaResult }) => {


  const [isSendSmsButtonDisabled, setIsSendSmsButtonDisabled] = useState(false);
  const [smsLoginForm] = Form.useForm();
  const [smsCooldown, setSmsCoolDown] = useState(-1);
  const captchaRef = useRef<any>(null); // 使用 useRef 来存储 captchaSettings  


  const validatePhoneNumber = () => {
  const phoneNumber = smsLoginForm.getFieldValue('phoneNumber');

  if (!phoneNumber) {
    message.error('请输入手机号');
    return false;
  }

  if (smsLoginForm.getFieldError('phoneNumber').length !== 0) {
    message.error('手机号不正确');
    return false;
  }

  return phoneNumber;
  };


  // 设置冷却时间
  const startCoolDown = () => {
    setSmsCoolDown(59);

    const coolDown = () => {
      setSmsCoolDown((value) => {
        const newValue = value - 1;
        if (newValue >= 0) {
          setTimeout(coolDown, 1000);
        }
        return newValue;
      });
    };

    setTimeout(coolDown, 1000);
  };


  // 主函数：发送短信验证码
  const sendSmsCode = async () => {
    const cid = smsLoginForm.getFieldValue('cid').split(',')[0];

    const phoneNumber = validatePhoneNumber();
    if (!phoneNumber) return;

    setIsSendSmsButtonDisabled(true);

    try {
      const captcha = await  getCaptchaResult();
      if (!captcha) return;

      const respData = await sendSmsRequest(cid, phoneNumber, captcha);

      smsLoginForm.setFieldsValue({ captchaKey: respData.captcha_key });

      startCoolDown();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendSmsButtonDisabled(false);
    }
  };

  // Main login function
  const loginWithSmsCode = async (values: any) => {
    // Validate the fields
    const errorMessage = validateFields(values);

    // If validation fails, show error and stop execution
    if (errorMessage) {
      showMessage(errorMessage, false);
      return;
    }

    // Disable button before sending request
    setIsSendSmsButtonDisabled(true);

    // Extract values from `values`
    const cid = values.cid.split(',')[0];
    const code = values.code;
    const phoneNumber = values.phoneNumber;
    const captchaKey = values.captchaKey;

    // Send the login request
    const resp = await sendSmsLoginRequest(cid, phoneNumber, code, captchaKey);

    // Show result message based on the response
    if (resp.code === 0) {
      showMessage('登录成功', true);
    } else {
      showMessage('登录失败', false);
    }

    // Re-enable the button after request completion
    setIsSendSmsButtonDisabled(false);
  };
  

  return (
<Form
          form={smsLoginForm}
          labelCol={{
            offset: 0,
            span: 7,
          }}
          requiredMark={false}
          onFinish={loginWithSmsCode}
        >
          {/* 区号选择 */}
          <Form.Item initialValue={'86,中国大陆'} label="区号" name="cid">
          <Select
                    showSearch
                    options={countryCallingCodes.map((c) => ({
                      label: `${c.name}(${c.cid})`,
                      // 区号有重复情况（比如美国和加拿大都是 +1）
                      value: `${c.cid.slice(1)},${c.name}`,
                    }))}
                  />
          </Form.Item>
    
          {/* 手机号输入框 */}
          <Form.Item
                  label="手机号"
                  name="phoneNumber"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      pattern: /^\d+$/,
                      message: '请输入正确的手机号。',
                    },
                  ]}
                >
                  <Input
                    
                  />
                </Form.Item>
    
          {/* 验证码输入框 */}
          <Form.Item
                  label="验证码"
                  name="code"
                  required
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      pattern: /^\d{6}$/,
                      message: '请输入正确的验证码。',
                    },
                  ]}
                >
                  <Input

                    type="code"
                  />
                </Form.Item>
          {/* 获取验证码按钮 */}
          <p>
            <Button
              onClick={sendSmsCode}
              style={{
                padding: '0',
              }}
              type="link"
              htmlType="button"
              disabled={isSendSmsButtonDisabled || smsCooldown >= 0}
            >
              {smsCooldown >= 0
                ? `${smsCooldown} 秒后可重新获取验证码`
                : '获取验证码'}
            </Button>
          </p>
    
          {/* 提交按钮 */}
          <div style={{ marginTop: "20px" }}>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </div>
        </Form>
  );
};

export default SmsLoginForm;
