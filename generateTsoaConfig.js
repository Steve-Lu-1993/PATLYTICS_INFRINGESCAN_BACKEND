const fs = require('fs');
const path = require('path');

// 獲取環境變數，或者使用默認值
const basePath = process.env.BASE_PATH || '/api';

// tsoa 配置
const tsoaConfig = {
  entryFile: 'src/app.ts',
  noImplicitAdditionalProperties: 'throw-on-extras',
  controllerPathGlobs: ['src/**/*Controller.ts'],
  routes: {
    basePath,  // 動態設置 basePath
    // routesDir: 'dist',
    routesDir: 'build',
    authenticationModule: './src/middlewares/express/expressAuthentication.ts',
  },
  spec: {
    basePath,  // 動態設置 basePath
    securityDefinitions: {
      api_key: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    // outputDirectory: 'dist',
    outputDirectory: 'build',
    specVersion: 3,
  },
};

// 將配置寫入到 tsoa.json 文件
const configPath = path.join(__dirname, 'tsoa.json');
fs.writeFileSync(configPath, JSON.stringify(tsoaConfig, null, 2));

console.log(`tsoa 配置已根據 ${basePath} 生成`);
