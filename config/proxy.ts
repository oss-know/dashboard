/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */

let DEV_SERVER = 'http://127.0.0.1:8000';
// Keep in mind that the proxy's url should take IP but not 'localhost'
if (process.env.DEV_SERVER) {
  DEV_SERVER = process.env.DEV_SERVER;
}

console.log('DEV_SERVER:', DEV_SERVER);

export default {
  dev: {
    // // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    // '/api/': {
    //   // 要代理的地址
    //   target: 'https://preview.pro.ant.design',
    //   // 配置了这个可以从 http 代理到 https
    //   // 依赖 origin 的功能可能需要这个，比如 cookie
    //   changeOrigin: true,
    // },
    '/api': {
      target: DEV_SERVER,
      changeOrign: true,
      pathRewrite: { '^/api': '' },
    },
  },
  test: {
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
