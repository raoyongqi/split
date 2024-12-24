const initializeCaptcha = (
  captchaRef: React.RefObject<any>  // Pass captchaRef as an argument
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!captchaRef.current) {
      reject(new Error('Captcha settings are not available.'));
      return;
    }

    initGeetest(
      {
        ...captchaRef.current.data.geetest,
        product: 'bind',
        https: true,
      },
      (captchaObj: any) => {
        captchaObj.appendTo('body');
        
        captchaObj.onSuccess(async () => {
          const result = captchaObj.getValidate();
          resolve({
            ...result,
            token: captchaRef.current.data.token,
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



const loadCaptchaSettings = async (captchaRef: React.RefObject<any>): Promise<any> => {
  
  if (!captchaRef.current) {
    
    try {
    
      const Captcha = await window.electronAPI.getCaptcha();
  
      captchaRef.current = Captcha; // Update the ref with settings
    } catch (error) {
  
      console.error('Error loading captcha settings:', error);
  
      throw new Error('Captcha settings could not be loaded.');
    }
  }
};



export { initializeCaptcha, loadCaptchaSettings };
