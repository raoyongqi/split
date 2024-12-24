import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, Form, message, Select } from "antd";
import countryCallingCodes from '../../../common/constants/country-calling-codes';
import { validateFields, showMessage } from '../../service/ValidCheckservice';
import { sendSmsLoginRequest, sendSmsRequest } from '../../service/SmsService';

interface SmsLoginFormProps {
  getCaptchaResult: () => Promise<any>;
}

const SmsLoginForm: React.FC<SmsLoginFormProps> = ({ getCaptchaResult }) => {
  const [isSendSmsButtonDisabled, setIsSendSmsButtonDisabled] = useState(false);
  const [smsCooldown, setSmsCoolDown] = useState(-1);
  const [smsLoginForm] = Form.useForm();

  // Start cooldown for SMS code
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

  // Validate phone number
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

  // Send SMS verification code
  const sendSmsCode = async () => {
    const cid = smsLoginForm.getFieldValue('cid').split(',')[0];
    const phoneNumber = validatePhoneNumber();
    if (!phoneNumber) return;

    setIsSendSmsButtonDisabled(true);

    try {
      const captcha = await getCaptchaResult();
      if (!captcha) return;

      const respData = await sendSmsRequest(cid, phoneNumber, captcha);
      // 将 captchaKey 设置到表单中
      console.log(respData.captcha_key)

      smsLoginForm.setFieldsValue({ captchaKey: respData.captcha_key});

      startCoolDown();

    } catch (err) {
      console.error(err);
    } finally {
      setIsSendSmsButtonDisabled(false);
    }
  };

  // Handle form submission
  const loginWithSmsCode = async (values: any) => {
    
    const errorMessage = validateFields(values);
    
    if (errorMessage) {
      showMessage(errorMessage, false);
      return;
    }

    setIsSendSmsButtonDisabled(true);

    const cid = values.cid.split(',')[0];
    const phoneNumber = values.phoneNumber;
    const code = values.code;
    const captchaKey = values.captchaKey;
        
    
    try {
      const resp = await sendSmsLoginRequest(cid, phoneNumber, code, captchaKey);

      if (resp.code === 0) {
        showMessage('登录成功', true);
      } else {
        showMessage('登录失败', false);
      }
    } catch (err) {
      console.error(err);
      showMessage('登录请求失败', false);
    } finally {
      setIsSendSmsButtonDisabled(false);
    }
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
        <Input />
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
        <Input type="code" />
      </Form.Item>

      {/* 获取验证码按钮 */}
      <p>
        <Button
          onClick={sendSmsCode}
          style={{ padding: '0' }}
          type="link"
          htmlType="button"
          disabled={isSendSmsButtonDisabled || smsCooldown >= 0}
        >
          {smsCooldown >= 0
            ? `${smsCooldown} 秒后可重新获取验证码`
            : '获取验证码'}
        </Button>
      </p>

      {/* 隐藏的 captchaKey 字段 */}
      <Form.Item name="captchaKey" hidden>
        <Input />
      </Form.Item>

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
