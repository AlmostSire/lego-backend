// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportTemplate from '../../../app/model/template';
import ExportUser from '../../../app/model/user';
import ExportWork from '../../../app/model/work';

declare module 'egg' {
  interface IModel {
    Template: ReturnType<typeof ExportTemplate>;
    User: ReturnType<typeof ExportUser>;
    Work: ReturnType<typeof ExportWork>;
  }
}
