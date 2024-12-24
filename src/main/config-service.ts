import IService from './IService';
import Store from 'electron-store';
import {
  AudioQuality,
  VideoCodec,
  VideoQuality,
} from '../common/constants/media-info';
import { app } from 'electron';
import path from 'path';
import Config from '../main/Config';

let store: Store<any>;

export function getStore() {
  if (!store) {
    store = new Store({
      clearInvalidConfig: true,
      schema: {
        proxy: {
          type: 'object',
          description: '代理配置',
          properties: {
            enable: {
              type: 'boolean',
              description: '启用代理',
              default: true,
            },
            useSystemProxy: {
              type: 'boolean',
              description: '使用系统代理',
              default: true,
            },
            url: {
              type: 'string',
              description: '代理 URL',
              default: 'http://127.0.0.1:7890',
              format: 'uri',
            },
          },
          default: {},
        },
        cookieString: {
          type: 'string',
          description: 'B 站登录后的 CookieString，不展示在配置页。',
          default: '',
        },
      },
    });
  }

  return store;
}

// 这样写是防止 preload 脚本调用时引用了 electron.app.getPath 而引起的报错。

const fns = {
  set: async (key: string, value: any) => getStore().set(key, value),
  // @ts-ignore 这样写可以获取到所有配置，故忽略 ts 错误。
  getAll: async () => getStore().get() as Promise<Config>,
  reset: async (...keys: string[]) => getStore().reset(...keys),
};

const configService: IService<typeof fns> = {
  name: 'config',
  fns,
};

export default configService;
