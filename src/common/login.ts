import crypto from 'crypto';
import GeetestCaptcha from '../main/GeetestCaptcha';
import configService from '../main/config-service';
import { getAxiosInstance, cookieJar } from '../main/network';
import {getSelfInfo} from './info';
export const loginWithPassword = async (
  username: string,
  password: string,
  captcha: GeetestCaptcha
): Promise<any> => {
  // 检查用户名和密码是否为空
  if (!username || !password) {
    console.error('username数据不完整:', username);
    console.error('password数据不完整:', password);

    throw new Error('用户名或密码不能为空'+username+password);
  }

  // 检查 captcha 数据是否完整
  if (!captcha.token || !captcha.challenge || !captcha.validate || !captcha.seccode) {
    console.error('Captcha 数据不完整:', captcha);
    throw new Error(`Captcha 数据不完整: ${JSON.stringify(captcha)}`);
  }

  // 获取 Axios 实例
  const axiosInstance = await getAxiosInstance();
  if (!axiosInstance) {
    throw new Error('无法初始化 Axios 实例');
  }

  try {
    // 获取加密配置
    console.log('正在获取加密配置...');
    const encryptionSettings: any = (
      await axiosInstance('https://passport.bilibili.com/x/passport-login/web/key')
    ).data;

    if (encryptionSettings.code !== 0) {
      console.error('获取加密配置错误:', encryptionSettings);
      throw new Error(`获取加密配置错误：${encryptionSettings.message}`);
    }

    console.log('加密配置:', encryptionSettings);

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

    console.log('加密后的密码:', encryptedPassword);

    // 发起登录请求
    console.log('正在发送登录请求...');
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
          'Host': 'passport.bilibili.com',
          'Fp_local': '7502a5a97a136a331e6de92445e1d73b202405261152412a63577be6d6b0fb98', // 可以根据实际情况修改
          'Fp_remote': '7502a5a97a136a331e6de92445e1d73b202405261152412a63577be6d6b0fb98', // 可以根据实际情况修改
          'Session_id': 'adafb459', // 会话 ID
          'Guestid': '23084900291443', // 客户端的唯一标识
          'Buvid': 'XY662D167D42D2CA56514685FD62A63F2A27F', // 设备标识
          'Env': 'prod', // 环境
          'App-Key': 'android64', // App 标识
          'X-Bili-Trace-Id': '200668e8ce5a227e83232415a0665434:83232415a0665434:0:0', // 请求追踪 ID
          'X-Bili-Aurora-Eid': '', // 如果有，填充相关信息
          'X-Bili-Mid': '', // 用户 MID（如果有）
          'X-Bili-Aurora-Zone': '', // 如果有
          'X-Bili-Gaia-Vtoken': '', // 如果有
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'Accept-Encoding': 'gzip, deflate', // 编码
        },
      }
    );

    console.log('登录请求结果:', loginResult.data);

    if (loginResult.data.code !== 0) {
      console.error('登录失败:', loginResult.data);
      return loginResult.data;
    }

    // 更新配置
    configService.fns.set(
      'cookieString',
      await cookieJar.getCookieString('https://www.bilibili.com/')
    );

    return loginResult.data;
  } catch (error) {
    console.error('登录过程中出现错误:', error);
    throw error;
  }
};

export const loginWithSmsCode = async (
  cid: string,
  phoneNumber: string,
  code: string,
  captchaKey: string
): Promise<any> => {
  // 检查输入数据是否完整
  let missingFields = [];

  if (!cid) missingFields.push('CID');
  if (!phoneNumber) missingFields.push('手机号');
  if (!code) missingFields.push('验证码');
  if (!captchaKey) missingFields.push('验证码密钥');
  
  if (missingFields.length > 0) {
    throw new Error(`SMS 登录数据不完整: 缺少字段: ${missingFields.join(', ')}`);
  }

  
  const axios = await getAxiosInstance();
  if (!axios) {
    throw new Error('无法初始化 Axios 实例');
  }

  try {
    console.log('正在发送 SMS 登录请求...');
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
    } else {
      console.error('SMS 登录失败:', resp);
    }

    return resp;
  } catch (error) {
    console.error('SMS 登录过程中出现错误:', error);
    throw error;
  }
};



// 封装登录逻辑
export  async function loginWithCookie(cookieString: string): Promise<boolean> {
  try {
    // 解析 cookieString 并设置到 cookieJar 中
    cookieString
      .split(';')
      .filter((cookie) => !!cookie.trim())
      .forEach((cookie) =>
        cookieJar.setCookieSync(
          `${cookie}; Domain=.bilibili.com`,
          'https://www.bilibili.com/'
        )
      );
  } catch (err) {
    console.error('Failed to set cookies:', err);
    return false;
  }
  const resp = await getSelfInfo();

  if (resp.code === 0) {
    // 登录成功，更新配置
    configService.fns.set(
      'cookieString',
      await cookieJar.getCookieString('https://www.bilibili.com/')
    );
  }

  return resp.code === 0;
  
}
