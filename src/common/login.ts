import crypto from 'crypto';
import GeetestCaptcha from '../main/GeetestCaptcha';
import configService from '../main/config-service';
import { getAxiosInstance, cookieJar } from '../main/network';

export const loginWithPassword = async (
  username: string,
  password: string,
  captcha: GeetestCaptcha
): Promise<any> => {
  const axiosInstance = await getAxiosInstance();

  // 获取加密配置
  const encryptionSettings: any = (
    await axiosInstance('https://passport.bilibili.com/x/passport-login/web/key')
  ).data;

  if (encryptionSettings.code !== 0) {
    throw new Error(`获取加密配置错误：${encryptionSettings.message}`);
  }

  // 加密密码
  const encryptedPassword = crypto
    .publicEncrypt(
      {
        key: crypto.createPublicKey(encryptionSettings.data.key),
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(`${encryptionSettings.data.hash}${password}`, 'utf-8')
    )
    .toString('base64');

  const loginResult = await axiosInstance.post(
    'https://passport.bilibili.com/x/passport-login/web/login',
    new URLSearchParams({
      source: 'main_web',
      username,
      password: encryptedPassword,
      keep: 'true',
      token: captcha.token,
      go_url: 'https://www.bilibili.com/',
      challenge: captcha.challenge,
      validate: captcha.validate,
      seccode: captcha.seccode,
    }).toString(),
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (loginResult.data.code !== 0) {
    return loginResult.data;
  }

  // 更新配置
  configService.fns.set(
    'cookieString',
    await cookieJar.getCookieString('https://www.bilibili.com/')
  );

  return loginResult.data;
};

export const  loginWithSmsCodesendSms = async (
    cid: string,
    phoneNumber: string,
    code: string,
    captchaKey: string
  )=>  {
    const axios = await getAxiosInstance();
    const resp: any = (
      await axios.post(
        'https://passport.bilibili.com/x/passport-login/web/login/sms',
        new URLSearchParams({
          cid,
          tel: phoneNumber,
          code,
          source: 'main_mini',
          keep: '0',
          captcha_key: captchaKey,
          go_url: 'https://www.bilibili.com/',
        }).toString()
      )
    ).data;
  
    if (resp.code === 0) {
      // 登录成功，更新配置
      configService.fns.set(
        'cookieString',
        await cookieJar.getCookieString('https://www.bilibili.com/')
      );
    }
  
    return resp;
  }
  