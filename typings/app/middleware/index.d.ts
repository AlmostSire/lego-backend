// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportCustomError from '../../../app/middleware/customError';

declare module 'egg' {
  interface IMiddleware {
    customError: typeof ExportCustomError;
  }
}
