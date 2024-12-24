import { CookieJar } from 'tough-cookie';
import { getSystemProxy } from 'os-proxy-config';
import configService from './config-service';
import crypto from 'crypto';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';

export const cookieJar = new CookieJar();

export async function TestProxy() {
  const config = await configService.fns.getAll();
    console.log(config )

return config
}