interface Config {

  proxy: {
    enable: boolean;
    useSystemProxy: boolean;
    url: string;
  };
  cookieString: string;
  update: {
    autoCheck: boolean;
  };
}

export default Config;
