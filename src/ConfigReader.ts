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
      console.error(`ERROR: ${err.message}`);
      throw err;
    }
  }
}