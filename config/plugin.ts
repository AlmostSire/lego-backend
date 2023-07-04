import { EggPlugin } from "egg";

const plugin: EggPlugin = {
  nunjucks: {
    enable: true,
    package: "egg-view-nunjucks",
  },
  mongoose: {
    enable: true,
    package: "egg-mongoose",
  },
  validate: {
    enable: true,
    package: "egg-validate",
  },
  bcrypt: {
    enable: true,
    package: "egg-bcrypt",
  },
};

export default plugin;