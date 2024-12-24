import { Tabs } from "antd";
import LoginForm from '../components/LoginItem/PasswordLoginForm';
import SmsLoginForm from '../components/LoginItem/SmsLoginForm';
import CookieLoginForm from '../components/LoginItem/CookieLoginForm';
import {initializeCaptcha,loadCaptchaSettings} from '../service/CaptchaService';
import React, { useEffect, useRef, useState } from 'react';

const Home: React.FC = () => {
  const captchaRef = useRef<any>(null); // 使用 useRef 来存储 captchaSettings  

  // 获取验证码的函数
  const getCaptchaResult = async (): Promise<any> => {
    try {
      await loadCaptchaSettings(captchaRef);  // 假设你有captchaRef和相关的加载方法
      return await initializeCaptcha(captchaRef);  // 假设这是初始化验证码的方法
    } catch (error) {
      console.error(error);
      throw new Error('Captcha settings could not be loaded or captcha initialization failed.');
    }
  };

  const tabItems = [
    {
      label: "密码登录",
      key: "1",
      children: <LoginForm getCaptchaResult={getCaptchaResult} />  // 将 getCaptchaResult 传递给子组件
    },
    {
      label: "手机号登录",
      key: "2",
      children: <SmsLoginForm getCaptchaResult={getCaptchaResult} />  // 同样传递给手机号登录子组件
    },
    {
      label: "Cookies 登录",
      key: "cookie",
      children: <CookieLoginForm />
    }
  ];

  return (
    <div>
      <h1>欢迎来到主页！</h1>
      <Tabs defaultActiveKey="1" centered items={tabItems} />
    </div>
  );
};

export default Home;
