import React, { useState } from 'react';
import { Input, Button, Tabs, Form, message, Select, Row } from "antd";
import LoginForm from '../components/LoginItem/PasswordLoginForm';
import SmsLoginForm from '../components/LoginItem/SmsLoginForm';
import CookieLoginForm from '../components/LoginItem/CookieLoginForm';

const Home: React.FC = () => {

  const tabItems = [
    {
      label: "密码登录",
      key: "1",
      children: <LoginForm/>
    },
    {
      label: "手机号登录",
      key: "2",
      children: <SmsLoginForm
/>
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
