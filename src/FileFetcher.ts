import { IConfig } from './ConfigReader';
import * as request from 'request-promise-native';
const fs = require('fs-extra');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
import * as chai from 'chai';

const API_URL = '/api/sn_vdr_risk_asmt/vrmexcelexport';
const ASSESSMENT_API_URL = '/api/now/table/asmt_assessment_instance';

const HEADERS = [
  {id: 'vendor', title: 'Vendor'},
  {id: 'assessment_name', title: 'Assessment name'},
  {id: 'questionnaire_name', title: 'Questionnaire Name'},
  {id: 'name', title: 'Name'},
  {id: 'question', title: 'question'},
  {id: 'data_type', title: 'Data type'},
  {id: 'answer_choices', title: 'Answer choices'},
  {id: 'correct_answers', title: 'Correct answers'},
  {id: 'actual_answers', title: 'Actual answers'},
  {id: 'mandatory', title: 'Mandatory'},
  {id: 'depends_on', title: 'Depends on'},
  {id: 'displayed_when', title: 'Displayed when'},
  {id: 'internal_comment', title: 'Internal comment'},
  {id: 'comments_for_vendor', title: 'Comments for vendor'},
  {id: 'follow_up', title: 'Follow up'},
  {id: 'related_issues', title: 'Related issues'}
];

export interface IAssessmentRecord {
  name: string;
  sys_id: string;
}

export class FileFetcher {

  private file: any;

  constructor(private config: IConfig) {
    this.file = createCsvWriter({path: this.config.output_file, header: HEADERS, append: false});
    console.log(this.file);
  }

  public async fetch() {

    const assessmentRecords = await this.getAssessmentIDs();


    console.log(assessmentRecords);

    const options = {
      uri: '',
      headers: {
        Authorization: this.generateCredentials()
      },
      json: true,
      resolveWithFullResponse: true,
    }

    console.log(`FETCHING ${assessmentRecords.length} FILES`);

    for (const s of assessmentRecords) {
      options.uri = `${this.config.instance}${API_URL}/${s.sys_id}`;
      console.log(`FETCHING FILE FROM ${options.uri}`);

      const response = await request.get(options);
      const body = response.body.result;

      chai.assert(body.hasOwnProperty('tabSeq'));
      chai.assert(body.tabSeq.length === 2);

      const tab = body.tabSeq[1];

      console.log(`TAB=${tab}`);

      const qHeader = {
        'vendor': body.vendor,
        'assessment_name': body.asmt_name,
        'questionnaire_name': body.questionnaire_name,
        'name': body.name};

      for (var x = 0; x < body.tabMap[tab].rows.length; x++) {

        if (x === 0) {
          continue;
        }

        const row = Object.values(body.tabMap[tab].rows[x]);
        const rowValues = {
          "serial_number": row[0],
          "question": row[1],
          "data_type": row[2],
          "answer_choices": row[3],
          "correct_answers": row[4],
          "actual_answers": row[5],
          "mandatory": row[6],
          "depends_on": row[7],
          "displayed_when": row[8],
          "internal_comment": row[9],
          "comments_for_vendor": row[10],
          "follow_up": row[11],
          "related_issues": row[12],
        }
        const records = Object.assign(qHeader, rowValues);

        await this.file.writeRecords([records]);

      }
    }

  }

  private async getAssessmentIDs(): Promise<IAssessmentRecord[]> {

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
    const sysIds: IAssessmentRecord[] = [];

    for (const r of response.body.result) {
      sysIds.push({name: r.name, sys_id: r.sys_id});
    }

    return sysIds;

  }

  private generateCredentials(): string {
    return `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`;
  }

}