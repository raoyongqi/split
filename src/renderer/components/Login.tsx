import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Login: React.FC = () => {
  const captchaSettingsRef = useRef<any>(null); // 使用 useRef 来存储 captchaSettings
  const [isLoading, setIsLoading] = useState<boolean>(false); // 用于管理是否加载中
  const [response, setResponse] = useState<any>(null);

  
  const fetchSalt= async () => {
    try {
      const data = await window.electronAPI.salt(); // 调用主进程的 fetchData 函数
      setResponse(data); // 设置响应数据
      console.log(data); // 打印响应数据到控制台
    } catch (error) {
      console.error('Error fetching data:', error); // 错误处理
    }
  };

  // 获取验证码结果
  const getCaptchaResult = async (): Promise<any> => {
    if (!captchaSettingsRef.current) {
      // 如果 captchaSettings 还没有加载，则加载它
      try {
        setIsLoading(true); // 设置加载状态
        const settings = await window.electronAPI.getCaptcha();
        captchaSettingsRef.current = settings; // 使用 ref 更新值
      } catch (error) {
        console.error('Error loading captcha settings:', error);
        throw new Error('Captcha settings could not be loaded.');
      } finally {
        setIsLoading(false); // 重置加载状态
      }
    }

    // 只有在 captchaSettings 已经加载后才继续
    return new Promise<any>((resolve, reject) => {
      if (!captchaSettingsRef.current) {
        reject(new Error('Captcha settings are not loaded.'));
        return;
      }

      // 使用设置来初始化验证码
      initGeetest(
        {
          ...captchaSettingsRef.current.data.geetest,
          product: 'bind',
          https: true,
        },
        (captchaObj: any) => {
          captchaObj.appendTo('body');
          captchaObj.onSuccess(async () => {
            const result = captchaObj.getValidate();
            resolve({
              ...result,
              token: captchaSettingsRef.current.data.token,
            });
          });
          captchaObj.onClose(() => resolve(null));
          captchaObj.onError((err: any) => {
            console.error(err);
            reject(
              new Error(
                `抱歉，验证码校验时出现了错误，请稍后再尝试！\n错误信息：${err.error_code} ${err.user_error}`
              )
            );
          });
          captchaObj.onReady(() => captchaObj.verify());
        }
      );
    });
  };

  // 处理验证码验证
  const handleCaptchaVerification = async () => {
    try {
      const result = await getCaptchaResult();
      console.log('Captcha verified successfully:', result);
    } catch (error) {
      console.error('Captcha verification failed:', error);
    }
  };
  return (
    <div className="login-container">
      <h1 className="login-title">Login Page</h1>
      
      
      <div style={{ margin: '20px 0' }}>
        <Input placeholder="Username" className="login-input" />
      </div>
      
      
      <div style={{ margin: '20px 0' }}>
        <Input.Password placeholder="Password" className="login-input" />
      </div>

      
      <div style={{ margin: '20px 0' }}>
        <Button
          className="login-button"
          onClick={fetchSalt}
        >
          获取盐
        </Button>
      </div>



      <div style={{ margin: '20px 0' }}>
        
        
        <Button
          className={`login-button ${isLoading ? 'loading' : ''}`}
          onClick={handleCaptchaVerification}
          disabled={isLoading}
        >
          {isLoading ? <Spin indicator={<LoadingOutlined spin />} /> : 'Verify Captcha'}
        </Button>



      </div>
    </div>
  );
};



export default Login;
