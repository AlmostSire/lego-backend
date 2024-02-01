// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportTemplate from '../../../app/controller/template';
import ExportTest from '../../../app/controller/test';
import ExportUser from '../../../app/controller/user';
import ExportUtils from '../../../app/controller/utils';
import ExportWork from '../../../app/controller/work';

declare module 'egg' {
  interface IController {
    template: ExportTemplate;
    test: ExportTest;
    user: ExportUser;
    utils: ExportUtils;
    work: ExportWork;
  }
}
