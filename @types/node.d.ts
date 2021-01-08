/* eslint-disable no-undef */
/* eslint-disable no-var */

declare namespace NodeJS {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    EMAIL: string;
    PASSWORD: string;
    [key: string]: string;
  }

  interface Process extends NodeJS.Process {
    env: ProcessEnv;
  }

  declare var process = Process;
}
