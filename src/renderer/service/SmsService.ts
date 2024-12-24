// Helper function to send the SMS login request


const sendSmsLoginRequest = async (cid: string, phoneNumber: string, code: string, captchaKey: string) => {
    try {
      const resp = await window.electronAPI.login_sms(cid, phoneNumber, code, captchaKey);
      return resp;
    } catch (error) {
      console.error('Login request failed:', error);
      return { code: -1 }; // In case of failure
    }
  };

  const sendSmsRequest = async (cid: string, phoneNumber: string, captcha:  any) => {
    const resp = await window.electronAPI.sms(cid, phoneNumber, {
      challenge: captcha.geetest_challenge,
      seccode: captcha.geetest_seccode,
      validate: captcha.geetest_validate,
      token: captcha.token,
    });
  
    if (resp.code !== 0) {
      throw new Error(`发送验证码失败：${resp.message}`);
    }
  
    return resp.data;
  };
  
export {sendSmsLoginRequest,sendSmsRequest};

