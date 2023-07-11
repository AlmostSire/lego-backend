import { userErrorMessages } from "./user";
import { WorkErrorMessages } from "./work";

export type GlobalErrorTypes = keyof (typeof userErrorMessages &
  typeof WorkErrorMessages);

export const globalErrorMessages = {
  ...userErrorMessages,
  ...WorkErrorMessages,
};
