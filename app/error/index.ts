import { userErrorMessages } from "./user";
import { WorkErrorMessages } from "./work";
import { utilsErrorMessages } from "./util";

export type GlobalErrorTypes = keyof (typeof userErrorMessages &
  typeof WorkErrorMessages &
  typeof utilsErrorMessages);

export const globalErrorMessages = {
  ...userErrorMessages,
  ...WorkErrorMessages,
  ...utilsErrorMessages,
};
