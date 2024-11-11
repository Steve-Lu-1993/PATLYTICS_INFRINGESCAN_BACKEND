const fs = require('fs');
const path = require('path');

const basePath = process.env.BASE_PATH || '/api';

const tsoaConfig = {
  entryFile: 'src/app.ts',
  noImplicitAdditionalProperties: 'throw-on-extras',
  controllerPathGlobs: ['src/**/*Controller.ts'],
  routes: {
    basePath, 
    routesDir: 'build',
    authenticationModule: './src/middlewares/express/expressAuthentication.ts',
  },
  spec: {
    basePath,
    securityDefinitions: {
      api_key: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    outputDirectory: 'build',
    specVersion: 3,
  },
};

const configPath = path.join(__dirname, 'tsoa.json');
fs.writeFileSync(configPath, JSON.stringify(tsoaConfig, null, 2));

console.log(`tsoa generated base on base path:${basePath}`);
