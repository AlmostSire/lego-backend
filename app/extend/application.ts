import { Application } from "egg";
import axios, { AxiosInstance } from "axios";
import Dysmsapi from "@alicloud/dysmsapi20170525";
import * as $OpenApi from "@alicloud/openapi-client";

const AXIOS = Symbol("Application#axios");
const ALCLIENT = Symbol("Application#ALCLIENT");

export default {
  echo(msg: string) {
    const that = this as Application;
    return `hello${msg}${that.config.name}`;
  },

  get axiosInstance(): AxiosInstance {
    if (!this[AXIOS]) {
      this[AXIOS] = axios.create({
        baseURL: "https://dog.ceo/",
        timeout: 8000,
      });
    }
    return this[AXIOS];
  },
  get ALClient(): Dysmsapi {
    const that = this as Application;
    const { accessKeyId, accessKeySecret, endpoint } =
      that.config.aliCloudConfig;
    if (!this[ALCLIENT]) {
      let config = new $OpenApi.Config({
        accessKeyId,
        accessKeySecret,
      });
      // 访问的域名
      config.endpoint = endpoint;
      this[ALCLIENT] = new Dysmsapi(config);
    }
    return this[ALCLIENT];
  },
};
