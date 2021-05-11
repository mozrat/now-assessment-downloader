import { ConfigReader, IConfig } from './ConfigReader';
import { FileFetcher } from './FileFetcher';

(async () => {
  try {
    const config: IConfig = new ConfigReader().read();
    await new FileFetcher(config).fetch();
  } catch (err) {
    console.error(`ERROR OCCURRED: ${err.message}`);
    process.exit(1);
  }
})();





