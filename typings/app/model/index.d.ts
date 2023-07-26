// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportUser from '../../../app/model/user';
import ExportWork from '../../../app/model/work';

declare module 'egg' {
  interface IModel {
    User: ReturnType<typeof ExportUser>;
    Work: ReturnType<typeof ExportWork>;
  }
}
