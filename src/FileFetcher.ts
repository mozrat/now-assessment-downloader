import { IConfig } from './ConfigReader';
import * as request from 'request-promise-native';
const fs = require('fs-extra');

const API_URL = '/api/sn_vdr_risk_asmt/vrmexcelexport';
const ASSESSMENT_API_URL = '/api/now/table/asmt_assessment_instance';

export class FileFetcher {

  constructor(private config: IConfig) {}

  public async fetch() {

    const sysIds = await this.getAssessmentIDs();

    console.log(sysIds);

    const options = {
      uri: '',
      headers: {
        Authorization: this.generateCredentials()
      },
      json: true,
      resolveWithFullResponse: true,
    }

    console.log(`FETCHING ${sysIds.length} FILES`);

    for (const s of sysIds) {
      options.uri = `${this.config.instance}${API_URL}/${s}`;
      console.log(`FETCHING FILE FROM ${options.uri}`);

      const response = await request.get(options);
      fs.writeFileSync(`${this.config.output_dir}/${s}.xlsx`, JSON.stringify(response.body.result));
      console.log(response);

    }



  }

  private async getAssessmentIDs(): Promise<string[]> {

    const url = `${this.config.instance}${ASSESSMENT_API_URL}?sysparm_query=${this.config.query}`;
    const options = {
      uri: url,
      headers: {
        Authorization: this.generateCredentials()
      },
      json: true,
      resolveWithFullResponse: true,
    };

    const response = await request.get(options);
    const sysIds: string[] = [];

    for (const r of response.body.result) {
      sysIds.push(r.sys_id);
    }

    return sysIds;

  }

  private generateCredentials(): string {
    return `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`;
  }

}