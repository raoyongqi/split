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
  ipcRenderer.invoke('login_password', username, password, captcha),

  login_cookies: (cookieString: string) => ipcRenderer.invoke('login_cookies', cookieString),

  getCookies: () => ipcRenderer.invoke('get-cookies'),

  downloadCookies: () => ipcRenderer.invoke('download-cookies'),

  getPageInfo: (num: number) => ipcRenderer.invoke('get-page-info', num),

  getSearchVideo: (keyword: string,page: number) => ipcRenderer.invoke('get-search-video', keyword,page),

  saveSearchResult: (data: any[], keyword: string, page: string) => ipcRenderer.invoke('save-search-result',data, keyword,page),
  
  readSearch: () => ipcRenderer.invoke('read-search'),
  
  
  saveSearch: (search: string) => ipcRenderer.invoke('save-search', search),

  downloadVideo: (url: string) => ipcRenderer.invoke('download-video', url),

  
}, 
);
