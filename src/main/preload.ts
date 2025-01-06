import { contextBridge, ipcRenderer } from 'electron';
import GeetestCaptcha from './GeetestCaptcha';
import { getCidByAid } from 'src/common/info';
import { downloadPlayUrlJson } from 'src/common/download';

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


  readSearch: () => ipcRenderer.invoke('read-search'),
  
  
  saveSearch: (search: string) => ipcRenderer.invoke('save-search', search),

  downloadVideo: (url: string) => ipcRenderer.invoke('download-video', url),

  getCidByAid: (aid: number) => ipcRenderer.invoke('aid-cid', aid),

  getCidByBvid: (bvid: string) => ipcRenderer.invoke('bvid-cid', bvid),
  
  getPlayUrl: (bvid: string,qn:number,fnval:number) => ipcRenderer.invoke('play-url', bvid,qn,fnval),
  
  getPlaySearch: (search: string,bvid: string,qn:number,fnval:number) => ipcRenderer.invoke('play-search', search,bvid,qn,fnval),

  downloadPlayUrl: (data: any[],bvid: string,qnfnval: string) => ipcRenderer.invoke('download-play-json', data,bvid,qnfnval),

  addUriToAria2: (uri: string) => ipcRenderer.invoke('aria2.addUri', uri),

  getBVDetails: (uri: string) => ipcRenderer.invoke('get-video-details', uri),

  readBv: () => ipcRenderer.invoke('read-bv'),
  
  saveBv: (bv: string) => ipcRenderer.invoke('save-bv', bv),




}, 
);
