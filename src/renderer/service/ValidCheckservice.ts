import { Input, Button, Tabs, Form, message, Select, Row } from "antd";


const validateFields = (values: any): string => {
    let errorMessage = '';
  
    if (!values.cid) {
      errorMessage += 'CID 不能为空。';
    }
    if (!values.code) {
      errorMessage += '验证码不能为空。';
    }
    if (!values.phoneNumber) {
      errorMessage += '手机号不能为空。';
    }
    if (!values.captchaKey) {
      errorMessage += '验证码密钥不能为空。';
    }
  
    return errorMessage;
  };
 // Helper function to display messages
 const showMessage = (messageText: string, success: boolean) => {
   if (success) {
     message.success(messageText);
   } else {
     message.error(messageText);
   }
 }; 



export {validateFields,showMessage};
  