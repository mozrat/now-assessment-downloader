const fs = require('fs-extra');

export interface IConfig {
  username: string;
  password: string;
  instance: string;
  query: string;
  output_file: string;
}

export class ConfigReader {

  public read(): IConfig {
    try {
      const config = JSON.parse(fs.readFileSync('config.json'));
      const localConfig = JSON.parse(fs.readFileSync('local_config.json'));
      return Object.assign(config, localConfig) as IConfig;
    } catch (err) {
      if (err.hasOwnProperty('code') && err.code === 'ENOENT') {
        console.error(`A file cannot be found: ${err.message}`);
        process.exit(1);
      }

      if (err.stack.startsWith('SyntaxError')) {
        console.error('There is an error with the JSON formatting');
        process.exit(1);
      }

      console.error(`ERROR: ${err.message}`);
      throw err;
    }
  }
}