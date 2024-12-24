import { contextBridge, ipcRenderer } from 'electron';
import GeetestCaptcha from './GeetestCaptcha';

// Define the types for the parameters in fetchPlaylistTracks
contextBridge.exposeInMainWorld('electronAPI', {
  getCaptcha: () => ipcRenderer.invoke('captcha'),
  salt: () => ipcRenderer.invoke('salt') , // 通过 ipcRenderer 发送请求}, 
  sms: (cid: string, phoneNumber: string, captcha: GeetestCaptcha) => ipcRenderer.invoke('sms', cid, phoneNumber, captcha),
  test_proxy:() => ipcRenderer.invoke('test_proxy') , 
  login_sms: (cid: string, phoneNumber: string, code: string, captchaKey: string) =>
    ipcRenderer.invoke('login_sms',  cid, phoneNumber, code, captchaKey ),
    login_password: (username: string, password: string, captcha: GeetestCaptcha) => 
    ipcRenderer.invoke('login_password', username, password, captcha)

}, 
);
