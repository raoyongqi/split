
declare global {
  interface Window {
    electronAPI: {

      salt: () => Promise<any>; // 假设返回类型为 `Promise<any>`，具体类型可以根据实际需求调整
      getCaptcha: () => Promise<any>;
      sms: (cid: string, phoneNumber: string, captcha: GeetestCaptcha) => Promise<any>;
      login_sms: (cid: string,
        phoneNumber: string,
        code: string,
        captchaKey: string) => Promise<any>;
      test_proxy:() => Promise<any>;
      login_password: (
        username: string,
        password: string,
        captcha: {
          challenge: string;
          seccode: string;
          validate: string;
          token: string;
        }
      ) => Promise<any>;  // 返回类型可以根据你的需求进一步调整

      login_cookies: (cookies: string) => Promise<any>; // 登录密码验证的接口

      getCookies: () => Promise<string>;
      downloadCookies: () => Promise<string>;
      getPageInfo: (num: number) => Promise<any>; // 返回类型为 Promise<any>，表示返回的是 JSON 数据
    };

  }
  declare const initGeetest: (...args: any) => any;
}

// 这个文件必须有一个 export 语句来让 TypeScript 识别为模块
export {};
