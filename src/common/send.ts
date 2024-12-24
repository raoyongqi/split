import axios from 'axios';
import { getAxiosInstance, cookieJar } from '../main/network';
import GeetestCaptcha from '../main/GeetestCaptcha';


 const sendSms = async (cid: string, phoneNumber: string, captcha: GeetestCaptcha) => {
  const axiosInstance = await getAxiosInstance();  // 假设 getAxiosInstance() 返回 axios 实例
  try {
    const response = await axiosInstance.post(
      'https://passport.bilibili.com/x/passport-login/web/sms/send',
      new URLSearchParams({
        cid,
        tel: phoneNumber,
        source: 'main_mini',
        ...captcha,
      }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to send SMS');
  }
};
export default sendSms;

